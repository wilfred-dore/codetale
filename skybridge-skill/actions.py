
import requests
import json
import logging
from typing import Dict, Any, List

# CodeTale API Configuration
CODETALE_API_BASE_URL = "https://pdsjlioujbfvkfmeoiwe.supabase.co/functions/v1"
HEADERS = {
    "Content-Type": "application/json"
}

# Helper function to call CodeTale API
def _call_analyze_repo(repo_url: str, options: Dict[str, Any] = {}) -> Dict[str, Any]:
    url = f"{CODETALE_API_BASE_URL}/analyze-repo"
    payload = {
        "repo_url": repo_url,
        "options": options
    }
    
    try:
        response = requests.post(url, headers=HEADERS, json=payload, timeout=60)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        logging.error(f"Error calling analyze-repo: {e}")
        return {"error": str(e)}

def _call_generate_presentation(github_url: str, mode: str, language: str) -> Dict[str, Any]:
    url = f"{CODETALE_API_BASE_URL}/generate-presentation"
    payload = {
        "githubUrl": github_url,
        "mode": mode,
        "language": language
    }

    try:
        response = requests.post(url, headers=HEADERS, json=payload, timeout=60)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        logging.error(f"Error calling generate-presentation: {e}")
        return {"error": str(e)}


# Action Definitions

def analyze_repository(repo_url: str, target_audience: str = "developer") -> Dict[str, Any]:
    """
    Analyzes a GitHub repository and returns a structured summary.
    """
    options = {
        "max_files": 30,
        "include_narrative": True,
        "include_mermaid": False,
        "target_audience": target_audience
    }
    return _call_analyze_repo(repo_url, options)

def explain_architecture(repo_url: str) -> Dict[str, Any]:
    """
    Explains the architecture of a GitHub repository, including a Mermaid diagram.
    """
    options = {
        "max_files": 30,
        "include_narrative": False,
        "include_mermaid": True,
        "target_audience": "developer"
    }
    return _call_analyze_repo(repo_url, options)

def compare_repositories(repo_url_1: str, repo_url_2: str) -> Dict[str, Any]:
    """
    Compares two GitHub repositories side-by-side based on analysis results.
    """
    
    # Run analysis in parallel ideally, but sequential for simplicity here
    result_1 = _call_analyze_repo(repo_url_1, {"max_files": 20})
    result_2 = _call_analyze_repo(repo_url_2, {"max_files": 20})
    
    return {
        "repo_1": {
            "url": repo_url_1,
            "analysis": result_1.get("analysis", {})
        },
        "repo_2": {
            "url": repo_url_2,
            "analysis": result_2.get("analysis", {})
        }
    }

def generate_pitch_deck(github_url: str, mode: str = "investor", language: str = "en") -> Dict[str, Any]:
    """
    Generates a pitch deck presentation for a GitHub repository.
    """
    return _call_generate_presentation(github_url, mode, language)

