LANGUAGE_CONFIG = {
    "c": {
        "extension": ".c",
        "compile": ["gcc", "main.c", "-o", "main"],
        "run": ["./main"]
    },
    "cpp": {
        "extension": ".cpp",
        "compile": ["g++", "main.cpp", "-o", "main"],
        "run": ["./main"]
    },
    "java": {
        "extension": ".java",
        "compile": ["javac", "Main.java"],
        "run": ["java", "Main"]
    },
    "python": {
        "extension": ".py",
        "compile": None,
        "run": ["python3", "main.py"]
    },
    "php": {
        "extension": ".php",
        "compile": None,
        "run": ["php", "main.php"]
    },
    "sql": {
        "validate_only": True
    },
    "jquery": {
        "validate_only": True
    }
}
