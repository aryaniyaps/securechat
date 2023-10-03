defmodule WsServerWeb.RabbitMQConsumer do
  defp rabbitmq_url, do: System.get_env("RABBITMQ_URL")
  defp queue_name, do: System.get_env("RABBITMQ_QUEUE_NAME")


  def child_spec(_opts) do
    %{
      id: __MODULE__,
      start: {__MODULE__, :start_link, []},
      type: :worker,
      restart: :permanent,
      shutdown: 5000
    }
  end

  def start_link do
    case AMQP.Connection.open(rabbitmq_url) do
      {:ok, connection} ->
        pid = spawn_link(fn ->
          channel = AMQP.Channel.open(connection)
          setup_queue(channel)
          setup_consumer(channel)
        end)
        {:ok, pid}
      {:error, _reason} = err ->
        err
    end
  end



  defp setup_queue({:ok, channel}) do
    AMQP.Queue.declare(channel, queue_name(), durable: false)
    {:ok, channel}
  end

  defp setup_consumer({:ok, channel}) do
    AMQP.Basic.consume(channel, queue_name(), nil, no_ack: true)
    receive_messages(channel)
  end


  defp receive_messages(channel) do
    AMQP.Basic.consume(channel, queue_name(), nil, no_ack: true)

    receive do
      {:basic_deliver, payload, _metadata} ->
        handle_message(payload)
        receive_messages(channel)
    end
  end

  defp handle_message(payload) do
    decoded_payload = Jason.decode!(payload)

    event_type = decoded_payload["event"]
    room_id = decoded_payload["roomId"]
    data = decoded_payload["payload"]

    WsServerWeb.Endpoint.broadcast(
      "rooms:#{room_id}",
      event_type,
      data
    )
  end
end
