from concurrent import futures
import grpc
import notification_pb2
import notification_pb2_grpc

class NotificationServicer(notification_pb2_grpc.NotificationServicer):
    def sendEvent(self, request, context):
        print("Primljeno obavestenje!")
        return notification_pb2.Response(res="OK")

def serve():
    server = grpc.server(futures.ThreadPoolExecutor(max_workers=10))
    notification_pb2_grpc.add_NotificationServicer_to_server(
        NotificationServicer(), server)
    server.add_insecure_port('[::]:8085')
    server.start()
    print("Grpc server serving on port 8085...")
    server.wait_for_termination()

if __name__ == "__main__":
    serve()