import sys
sys.path.append("..")
import asyncio
from backend.app.api.endpoints.ask_agent import ask_agent, AskRequest

class DummyRequest:
    headers = {}

async def main():
    from backend.app.db.session import async_session
    print("Starting session...")
    async with async_session() as session:
        payload = AskRequest(patient_id=1, question="What should I eat?", language="en", condition_context=[])
        req = DummyRequest()
        try:
            print("Calling ask_agent...")
            task = asyncio.create_task(ask_agent(payload, req, session))
            done, pending = await asyncio.wait([task], timeout=10)
            if pending:
                print("ask_agent timed out after 10 seconds!")
                for t in pending:
                    t.cancel()
            else:
                for t in done:
                    print("ask_agent finished with:", t.result() if not t.exception() else t.exception())
        except Exception as e:
            print("Error:", e)
        print("Done calling ask_agent.")

if __name__ == "__main__":
    if sys.platform == 'win32':
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
    asyncio.run(main())
