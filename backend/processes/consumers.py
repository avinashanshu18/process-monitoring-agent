import json
from channels.generic.websocket import AsyncWebsocketConsumer

class ProcessConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.hostname = self.scope['url_route']['kwargs']['hostname']
        self.group_name = f"process_{self.hostname}"
        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.group_name, self.channel_name)

    async def send_snapshot(self, event):
        await self.send(text_data=json.dumps(event['data']))
