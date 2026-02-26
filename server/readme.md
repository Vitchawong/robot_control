
# Publish to public broker
mosquitto_pub -h broker.hivemq.com -p 1883 -t robot/telemetry/ohm123 -m "{\"device_id\":\"robot01\",\"temp\":25,\"airpollution\":40,\"speed\":1512,\"created_at\":\"2026-02-23T13:07:08.000Z\"}"

# Subscribe to public broker for controlling


