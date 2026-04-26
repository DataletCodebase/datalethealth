import time
import subprocess
import os
from datetime import datetime

WATCH_PATHS = [
    "data",
    "domain.yml",
    "config.yml",
    "rules.yml",
    "stories.yml"
]

CHECK_INTERVAL = 3
DEBOUNCE_TIME = 5


def last_modified_time():
    latest = 0

    for path in WATCH_PATHS:

        if os.path.isfile(path):
            latest = max(latest, os.path.getmtime(path))

        elif os.path.isdir(path):
            for root, _, files in os.walk(path):
                for f in files:
                    full = os.path.join(root, f)
                    latest = max(latest, os.path.getmtime(full))

    return latest


print("👀 Watching Rasa training files...")

last_time = last_modified_time()

while True:

    time.sleep(CHECK_INTERVAL)

    new_time = last_modified_time()

    if new_time > last_time:

        print("\n⚡ Change detected at", datetime.now().strftime("%H:%M:%S"))

        # debounce (wait for file save to finish)
        time.sleep(DEBOUNCE_TIME)

        print("🚀 Training Rasa model...")

        try:
            subprocess.run(
                ["rasa", "train"],
                check=True
            )

            print("✅ Model training completed!")

            # OPTIONAL → restart servers automatically
            print("🔁 Restarting Rasa servers...")

            subprocess.Popen(["pkill", "-f", "rasa run"], shell=True)
            subprocess.Popen(["pkill", "-f", "rasa run actions"], shell=True)

            time.sleep(2)

            subprocess.Popen(["rasa", "run", "--enable-api", "--cors", "*"])
            subprocess.Popen(["rasa", "run", "actions"])

            print("🟢 Servers restarted!")

        except Exception as e:
            print("❌ Training failed:", e)

        last_time = new_time