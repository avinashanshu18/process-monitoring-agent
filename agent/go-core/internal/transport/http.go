package transport

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"
	"time"

	"hostlens-go-agent/internal/model"
)

func PostSnapshot(endpoint, apiKey string, payload model.SnapshotPayload) (model.PostResponse, error) {
	body, err := json.Marshal(payload)
	if err != nil {
		return model.PostResponse{}, err
	}

	request, err := http.NewRequest(http.MethodPost, endpoint, bytes.NewReader(body))
	if err != nil {
		return model.PostResponse{}, err
	}
	request.Header.Set("Content-Type", "application/json")
	request.Header.Set("X-API-Key", apiKey)

	client := &http.Client{Timeout: 20 * time.Second}
	response, err := client.Do(request)
	if err != nil {
		return model.PostResponse{}, err
	}
	defer response.Body.Close()

	if response.StatusCode >= 300 {
		payload, _ := io.ReadAll(io.LimitReader(response.Body, 2048))
		return model.PostResponse{}, fmt.Errorf("server error %d: %s", response.StatusCode, string(payload))
	}

	var parsed model.PostResponse
	if err := json.NewDecoder(response.Body).Decode(&parsed); err != nil {
		return model.PostResponse{}, err
	}

	return parsed, nil
}

func controlBaseURL(endpoint string) string {
	return strings.TrimSuffix(endpoint, "/process-snapshots/")
}

func FetchNextAction(endpoint, apiKey, agentID string) (*model.AgentAction, error) {
	request, err := http.NewRequest(
		http.MethodGet,
		fmt.Sprintf("%s/agent/actions/next/?agent_id=%s", controlBaseURL(endpoint), agentID),
		nil,
	)
	if err != nil {
		return nil, err
	}
	request.Header.Set("X-API-Key", apiKey)

	client := &http.Client{Timeout: 20 * time.Second}
	response, err := client.Do(request)
	if err != nil {
		return nil, err
	}
	defer response.Body.Close()

	if response.StatusCode == http.StatusNoContent {
		return nil, nil
	}
	if response.StatusCode >= 300 {
		payload, _ := io.ReadAll(io.LimitReader(response.Body, 2048))
		return nil, fmt.Errorf("agent action fetch error %d: %s", response.StatusCode, string(payload))
	}

	var parsed model.AgentAction
	if err := json.NewDecoder(response.Body).Decode(&parsed); err != nil {
		return nil, err
	}
	return &parsed, nil
}

func PostActionResult(endpoint, apiKey, actionID string, payload model.AgentActionResult) error {
	body, err := json.Marshal(payload)
	if err != nil {
		return err
	}

	request, err := http.NewRequest(
		http.MethodPost,
		fmt.Sprintf("%s/agent/actions/%s/result/", controlBaseURL(endpoint), actionID),
		bytes.NewReader(body),
	)
	if err != nil {
		return err
	}
	request.Header.Set("Content-Type", "application/json")
	request.Header.Set("X-API-Key", apiKey)

	client := &http.Client{Timeout: 20 * time.Second}
	response, err := client.Do(request)
	if err != nil {
		return err
	}
	defer response.Body.Close()

	if response.StatusCode >= 300 {
		payload, _ := io.ReadAll(io.LimitReader(response.Body, 2048))
		return fmt.Errorf("agent action result error %d: %s", response.StatusCode, string(payload))
	}
	return nil
}
