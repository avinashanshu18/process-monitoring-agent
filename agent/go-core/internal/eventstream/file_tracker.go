package eventstream

import (
	"crypto/sha256"
	"encoding/hex"
	"fmt"
	"os"
	"path/filepath"
	"sync"
	"time"

	"hostlens-go-agent/internal/collector"
	"hostlens-go-agent/internal/model"

	"github.com/fsnotify/fsnotify"
)

const maxQueuedFileEvents = 200
const maxWatchDirectories = 256
const maxWatchDepth = 2

type FileTracker struct {
	watcher *fsnotify.Watcher

	mu       sync.Mutex
	events   []model.FileEvent
	targets  []collector.IntegrityTarget
	stopOnce sync.Once
}

func NewFileTracker() (*FileTracker, error) {
	watcher, err := fsnotify.NewWatcher()
	if err != nil {
		return nil, err
	}

	tracker := &FileTracker{
		watcher: watcher,
		targets: collector.IntegrityWatchTargets(),
	}

	if err := tracker.registerWatchTargets(); err != nil {
		_ = watcher.Close()
		return nil, err
	}

	go tracker.run()
	return tracker, nil
}

func (tracker *FileTracker) registerWatchTargets() error {
	seen := make(map[string]struct{})
	for _, target := range tracker.targets {
		watchPath := target.Path
		if !target.Directory {
			watchPath = filepath.Dir(target.Path)
		}
		watchPath = filepath.Clean(watchPath)
		if watchPath == "." || watchPath == string(os.PathSeparator) {
			// Allow root or current as valid only if they exist.
		}
		if _, exists := seen[watchPath]; exists {
			continue
		}
		if _, err := os.Stat(watchPath); err != nil {
			continue
		}
		if err := tracker.addWatchPath(watchPath, seen, 0); err != nil {
			continue
		}
	}
	return nil
}

func (tracker *FileTracker) addWatchPath(path string, seen map[string]struct{}, depth int) error {
	if len(seen) >= maxWatchDirectories {
		return nil
	}
	if _, exists := seen[path]; exists {
		return nil
	}
	info, err := os.Stat(path)
	if err != nil {
		return err
	}
	if err := tracker.watcher.Add(path); err != nil {
		return err
	}
	seen[path] = struct{}{}
	if !info.IsDir() || depth >= maxWatchDepth {
		return nil
	}
	entries, err := os.ReadDir(path)
	if err != nil {
		return nil
	}
	for _, entry := range entries {
		if !entry.IsDir() {
			continue
		}
		childPath := filepath.Join(path, entry.Name())
		_ = tracker.addWatchPath(childPath, seen, depth+1)
	}
	return nil
}

func (tracker *FileTracker) run() {
	for {
		select {
		case event, ok := <-tracker.watcher.Events:
			if !ok {
				return
			}
			tracker.capture(event)
		case _, ok := <-tracker.watcher.Errors:
			if !ok {
				return
			}
		}
	}
}

func (tracker *FileTracker) capture(event fsnotify.Event) {
	category, ok := collector.IntegrityCategoryForPath(event.Name)
	if !ok {
		if event.Has(fsnotify.Create) {
			if info, err := os.Stat(event.Name); err == nil && info.IsDir() {
				_ = tracker.watcher.Add(event.Name)
			}
		}
		return
	}

	fileEvent := model.FileEvent{
		Path:       filepath.Clean(event.Name),
		Category:   category,
		Action:     fileAction(event),
		OccurredAt: time.Now().UTC().Format(time.RFC3339),
		SHA256:     fileSHA256(event.Name),
		Mode:       fileMode(event.Name),
	}

	tracker.mu.Lock()
	defer tracker.mu.Unlock()
	tracker.events = append(tracker.events, fileEvent)
	if len(tracker.events) > maxQueuedFileEvents {
		tracker.events = tracker.events[len(tracker.events)-maxQueuedFileEvents:]
	}
}

func (tracker *FileTracker) Drain() []model.FileEvent {
	tracker.mu.Lock()
	defer tracker.mu.Unlock()
	if len(tracker.events) == 0 {
		return nil
	}
	events := append([]model.FileEvent(nil), tracker.events...)
	tracker.events = nil
	return events
}

func (tracker *FileTracker) Sources() []string {
	return []string{"fsnotify-event-stream"}
}

func (tracker *FileTracker) Close() error {
	var err error
	tracker.stopOnce.Do(func() {
		err = tracker.watcher.Close()
	})
	return err
}

func fileAction(event fsnotify.Event) string {
	switch {
	case event.Has(fsnotify.Create):
		return "created"
	case event.Has(fsnotify.Write):
		return "modified"
	case event.Has(fsnotify.Remove):
		return "removed"
	case event.Has(fsnotify.Rename):
		return "renamed"
	case event.Has(fsnotify.Chmod):
		return "permissions_changed"
	default:
		return "observed"
	}
}

func fileMode(path string) string {
	info, err := os.Stat(path)
	if err != nil {
		return ""
	}
	return fmt.Sprintf("%#o", info.Mode().Perm())
}

func fileSHA256(path string) string {
	data, err := os.ReadFile(path)
	if err != nil {
		return ""
	}
	hash := sha256.Sum256(data)
	return hex.EncodeToString(hash[:])
}
