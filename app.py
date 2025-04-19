import json
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from google import genai
from google.genai import types

@csrf_exempt
def generate_text(request):
    if request.method == "POST":
        client = genai.Client(api_key="AIzaSyDsqllXdHi4MwFskfrIpaNOfMNOc4Yphhk")
        body = json.loads(request.body)
        input_text = body.get("input_text")
        result = client.models.generate_content(
            model="gemini-2.5-pro-exp-03-25",
            contents=[input_text],
            config=types.GenerateContentConfig(
            max_output_tokens=2000
            )
        )
        return JsonResponse({"response": result.text})
    return JsonResponse({"error": "Only POST allowed"}, status=405)