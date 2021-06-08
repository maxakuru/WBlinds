from subprocess import check_output
import platform

Import("env")


def is_tool(name):
    cmd = "where" if platform.system() == "Windows" else "which"
    try:
        check_output([cmd, name])
        return True
    except:
        return False


def build_web():
    if is_tool("yarn"):
        print("Attempting to build UI...")
        try:
            print(check_output(["yarn"]))
            print(check_output(["yarn", "build:cpp"]))
        except Exception as e:
            print("Encountered error", type(e).__name__, "building webpage:", e)
            print("WARNING: Failed to build UI.")


build_web()
