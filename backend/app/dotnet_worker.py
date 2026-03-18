# dotnet_worker.py
import threading
import queue
import tempfile
import os
import subprocess

compile_queue = queue.Queue()
results = {}
results_lock = threading.Lock()

def worker():
    while True:
        try:
            task_id, code, user_input = compile_queue.get()
            print(f"🛠 Worker picked task {task_id}")

            try:
                with tempfile.TemporaryDirectory() as temp_dir:
                    env = os.environ.copy()
                    env["DOTNET_CLI_TELEMETRY_OPTOUT"] = "1"
                    env["DOTNET_SKIP_FIRST_TIME_EXPERIENCE"] = "1"
                    env["NUGET_PACKAGES"] = os.path.join(temp_dir, ".nuget")

                    # Create console project
                    subprocess.run(
                        ["dotnet", "new", "console", "--no-restore"],
                        cwd=temp_dir, env=env, check=True,
                        capture_output=True, text=True
                    )

                    # Write Program.cs
                    program_file = os.path.join(temp_dir, "Program.cs")
                    with open(program_file, "w", encoding="utf-8") as f:
                        f.write(code)

                    # Restore
                    subprocess.run(
                        ["dotnet", "restore"],
                        cwd=temp_dir, env=env,
                        check=True, capture_output=True,
                        text=True, timeout=30
                    )

                    # Build
                    subprocess.run(
                        ["dotnet", "build", "--no-restore", "-c", "Release"],
                        cwd=temp_dir, env=env,
                        check=True, capture_output=True,
                        text=True, timeout=20
                    )

                    # Run with input
                    run = subprocess.run(
                        ["dotnet", "run", "--no-build", "-c", "Release"],
                        cwd=temp_dir,
                        env=env,
                        input=user_input,
                        capture_output=True,
                        text=True,
                        timeout=5
                    )

                    output = run.stdout.strip() or "No output"

            except subprocess.TimeoutExpired:
                output = "Execution timed out"
            except subprocess.CalledProcessError as e:
                output = f"Error:\n{e.stderr}"
            except Exception as e:
                output = f"Exception: {str(e)}"

            with results_lock:
                results[task_id] = output

            compile_queue.task_done()
        except Exception as e:
            print("Worker exception:", e)

# Start worker threads
for i in range(10):  # 10 simultaneous users
    t = threading.Thread(target=worker, daemon=True)
    t.start()
