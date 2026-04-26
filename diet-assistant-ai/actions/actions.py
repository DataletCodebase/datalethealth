# from typing import Any, Text, Dict, List
# from rasa_sdk import Action, Tracker
# from rasa_sdk.executor import CollectingDispatcher
# import requests

# # ⭐ GROQ CONFIG
# GROQ_API_KEY = "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"
# GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"

# # ⭐ COMMON AI CALL FUNCTION
# def ask_ai(user_message):
#     prompt = f"""
#     User asked: {user_message}
#     You are a smart Diet Assistant.
#     1. Answer briefly
#     2. Promote healthy eating
#     3. Encourage balanced diet
#     4. If question unrelated → still connect to diet/health
#     5. Always suggest our diet platform at end
#     Example:
#     "You can learn diet tips from our platform 😊"
#     """
#     try:
#         response = requests.post(
#             GROQ_URL,
#             headers={
#                 "Authorization": f"Bearer {GROQ_API_KEY}",
#                 "Content-Type": "application/json"
#             },
#             json={
#                 "model": "llama3-8b-8192",
#                 "messages": [
#                     {"role": "user", "content": prompt}
#                 ]
#             },
#             timeout=8
#         )
#         response.raise_for_status()
#         data = response.json()
#         return data["choices"][0]["message"]["content"]
#     except Exception as e:
#         print(f"Error calling Groq API: {e}")
#         return "Sorry 😔 AI service not responding. Please try again."

# # ⭐ MAIN DYNAMIC ANSWER ACTION
# class ActionDynamicDietAnswer(Action):
#     def name(self) -> Text:
#         return "action_dynamic_diet_answer"

#     def run(self,
#             dispatcher: CollectingDispatcher,
#             tracker: Tracker,
#             domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        
#         user_message = tracker.latest_message.get("text")
#         ai_reply = ask_ai(user_message)
        
#         dispatcher.utter_message(text=ai_reply)
        
#         # ⭐ Resume diet flow automatically
#         dispatcher.utter_message(
#             text="By the way 🙂 did you complete your breakfast today?"
#         )
#         return []

# # ⭐ MOTIVATION ACTION
# class ActionMotivateUser(Action):
#     def name(self) -> Text:
#         return "action_motivate_user"

#     def run(self, 
#             dispatcher: CollectingDispatcher, 
#             tracker: Tracker, 
#             domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        
#         dispatcher.utter_message(
#             text="You are doing great 👍 Consistency in diet gives long term results."
#         )
#         dispatcher.utter_message(
#             text="Would you like a personalised diet plan from our experts?"
#         )
#         return []

# # ⭐ MARKETING CTA ACTION
# class ActionSuggestWebsite(Action):
#     def name(self) -> Text:
#         return "action_suggest_website"

#     def run(self, 
#             dispatcher: CollectingDispatcher, 
#             tracker: Tracker, 
#             domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        
#         dispatcher.utter_message(
#             text="🔥 We can help you with personalised diet tracking."
#         )
#         dispatcher.utter_message(
#             text="👉 Try our Diet Assistant here: https://yourwebsite.com"
#         )
#         return []

# # ⭐ WEIGHT ISSUE SMART RESPONSE
# class ActionWeightCoach(Action):
#     def name(self) -> Text:
#         return "action_weight_coach"

#     def run(self, 
#             dispatcher: CollectingDispatcher, 
#             tracker: Tracker, 
#             domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        
#         dispatcher.utter_message(
#             text="Weight changes depend on calories, activity and sleep."
#         )
#         dispatcher.utter_message(
#             text="Would you like expert guidance?"
#         )
#         return []

# # ⭐ RANDOM CHAT REDIRECT
# class ActionRedirectToDiet(Action):
#     def name(self) -> Text:
#         return "action_redirect_to_diet"

#     def run(self, 
#             dispatcher: CollectingDispatcher, 
#             tracker: Tracker, 
#             domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        
#         user_message = tracker.latest_message.get("text")
#         ai_reply = ask_ai(user_message)
        
#         dispatcher.utter_message(text=ai_reply)
#         dispatcher.utter_message(
#             text="Fitness starts from food 🙂 Shall I track your meals today?"
#         )
#         return []


# from typing import Any, Text, Dict, List
# from rasa_sdk import Action, Tracker
# from rasa_sdk.executor import CollectingDispatcher
# from rasa_sdk.events import SlotSet, ActiveLoop
# import requests



# ⭐ CONFIG
# GROQ_API_KEY = "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"
# GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"


# ⭐ COMMON AI CALL
# def ask_ai(user_message):

#     try:
#         response = requests.post(
#             GROQ_URL,
#             headers={
#                 "Authorization": f"Bearer {GROQ_API_KEY}",
#                 "Content-Type": "application/json"
#             },
#             json={
#                 "model": "llama3-8b-8192",
#                 "messages": [
#                     {
#                         "role": "system",
#                         "content": """
# You are a friendly conversational Diet Assistant.

# Rules:
# - Answer ANY question user asks.
# - Keep answers SHORT.
# - Always relate answer to health / fitness / diet.
# - Always promote our diet platform.
# - End with soft CTA like:
# "Would you like to try our Diet Assistant 🙂"
# """
#                     },
#                     {
#                         "role": "user",
#                         "content": user_message
#                     }
#                 ],
#                 "temperature": 0.7,
#                 "max_tokens": 200
#             },
#             timeout=10
#         )

#         response.raise_for_status()

#         data = response.json()

#         return data["choices"][0]["message"]["content"]

#     except Exception as e:
#         print("Groq Error:", e)
#         return "AI service is not responding right now."

# ⭐ GARBAGE TEXT CHECK
# def is_garbage(text):
#     if not text:
#         return True
#     text = text.strip()
#     if len(text) < 3:
#         return True
#     if not any(c.isalpha() for c in text):
#         return True
#     return False


# # ⭐ ASK AI FUNCTION (SMART INTERACTIVE PROMPT)
# def ask_ai(user_message):

#     try:
#         response = requests.post(
#             GROQ_URL,
#             headers={
#                 "Authorization": f"Bearer {GROQ_API_KEY}",
#                 "Content-Type": "application/json"
#             },
#             json={
#                 "model": "llama-3.1-8b-instant",
#                 "messages": [
#                     {
#                         "role": "system",
#                         "content": """
# You are a smart friendly AI Diet Assistant chatbot.

# Conversation Rules:

# 1. First understand user intention.

# 2. If user asks about FOOD / DIET / HEALTH / FITNESS:
#    → Give simple helpful advice
#    → Ask follow-up question about meals or habits.

# 3. If user asks GENERAL KNOWLEDGE:
#    → Answer normally.
#    → Do NOT force diet connection.

# 4. If user sends RANDOM TEXT:
#    → Ask politely to repeat.

# 5. If user greets:
#    → Welcome warmly.
#    → Ask what they ate today.

# 6. Keep answers:
#    → Short
#    → Simple
#    → Friendly
#    → Interactive

# 7. Encourage healthy lifestyle naturally.

# 8. Never give wrong political facts.

# 9. Never repeat same line again.

# 10. Sound like a real human assistant.
# """
#                     },
#                     {
#                         "role": "user",
#                         "content": user_message
#                     }
#                 ],
#                 "temperature": 0.6,
#                 "max_tokens": 120
#             },
#             timeout=10
#         )

#         response.raise_for_status()
#         data = response.json()

#         return data["choices"][0]["message"]["content"]

#     except Exception as e:
#         print("Groq Error:", e)
#         return "😅 Sorry, I am facing a small issue right now. Please try again."


# # ⭐ MAIN DYNAMIC ANSWER
# class ActionDynamicDietAnswer(Action):

#     def name(self) -> Text:
#         return "action_dynamic_diet_answer"

#     def run(self,
#             dispatcher: CollectingDispatcher,
#             tracker: Tracker,
#             domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:

#         user_message = tracker.latest_message.get("text")

#         if is_garbage(user_message):
#             dispatcher.utter_message(
#                 text="😅 I didn’t understand that. Can you type again?"
#             )
#             return []

#         ai_reply = ask_ai(user_message)

#         dispatcher.utter_message(text=ai_reply)

#         return []


# # ⭐ REDIRECT TO DIET FUNNEL
# class ActionRedirectToDiet(Action):

#     def name(self) -> Text:
#         return "action_redirect_to_diet"

#     def run(self, dispatcher, tracker, domain):

#         dispatcher.utter_message(
#             text="🙂 Healthy lifestyle starts from diet. Shall we track your meals today?"
#         )

#         return []


# # ⭐ WEIGHT COACH
# class ActionWeightCoach(Action):

#     def name(self) -> Text:
#         return "action_weight_coach"

#     def run(self, dispatcher, tracker, domain):

#         dispatcher.utter_message(
#             text="Weight depends on calories, activity and sleep."
#         )

#         dispatcher.utter_message(
#             text="Would you like personalised diet guidance?"
#         )

#         return []


# # ⭐ MOTIVATION
# class ActionMotivateUser(Action):

#     def name(self) -> Text:
#         return "action_motivate_user"

#     def run(self, dispatcher, tracker, domain):

#         dispatcher.utter_message(
#             text="🔥 You are doing great. Small daily habits create big health results."
#         )

#         return []


# # ⭐ WEBSITE CTA
# class ActionSuggestWebsite(Action):

#     def name(self) -> Text:
#         return "action_suggest_website"

#     def run(self, dispatcher, tracker, domain):

#         dispatcher.utter_message(
#             text="👉 We can help you track meals and stay fit."
#         )

#         dispatcher.utter_message(
#             text="Try our Diet Assistant platform: https://yourwebsite.com"
#         )

#         return []


# def ask_ai(msg):

#     try:
#         res = requests.post(
#             GROQ_URL,
#             headers={
#                 "Authorization": f"Bearer {GROQ_API_KEY}",
#                 "Content-Type": "application/json"
#             },
#             json={
#                 "model": "llama-3.1-8b-instant",
#                 "messages": [
#                     {
#                         "role": "system",
#                         "content": """
# You are a friendly interactive diet assistant.

# Always:
# - answer simply
# - ask one follow-up
# - sound human
# """
#                     },
#                     {"role": "user", "content": msg}
#                 ],
#                 "temperature": 0.7,
#                 "max_tokens": 120
#             }
#         )

#         return res.json()["choices"][0]["message"]["content"]

#     except:
#         return "😅 I am having a small issue right now."


# # ================= MODE SWITCH =================

# class ActionSetMealMode(Action):

#     def name(self):
#         return "action_set_meal_mode"

#     def run(self, dispatcher, tracker, domain):

#         dispatcher.utter_message(
#             text="👍 Great! Let’s track your meals today."
#         )

#         return [
#             SlotSet("conversation_mode", "meal_tracking")
#         ]


# # ================= AI ANSWER =================

# class ActionDynamicDietAnswer(Action):

#     def name(self):
#         return "action_dynamic_diet_answer"

#     def run(self, dispatcher, tracker, domain):

#         msg = tracker.latest_message.get("text")
#         mode = tracker.get_slot("conversation_mode")

#         reply = ask_ai(msg)

#         dispatcher.utter_message(text=reply)

#         # guide back if user was tracking meals
#         if mode == "meal_tracking":
#             dispatcher.utter_message(
#                 text="🙂 Shall we continue tracking your meals?"
#             )

#         return []


# # ================= FOOD MEMORY =================

# class ActionFoodCoach(Action):

#     def name(self):
#         return "action_food_coach"

#     def run(self, dispatcher, tracker, domain):

#         food = tracker.latest_message.get("text")

#         dispatcher.utter_message(
#             text=f"Nice 👍 {food} sounds healthy."
#         )

#         dispatcher.utter_message(
#             text="Did you eat this for breakfast, lunch or dinner?"
#         )

#         return []


# # ================= MEAL SUMMARY =================

# class ActionMealSummary(Action):

#     def name(self):
#         return "action_meal_summary"

#     def run(self, dispatcher, tracker, domain):

#         b = tracker.get_slot("breakfast_status")
#         l = tracker.get_slot("lunch_status")
#         d = tracker.get_slot("dinner_status")

#         dispatcher.utter_message(
#             text=f"📊 Today’s diet summary:\nBreakfast: {b}\nLunch: {l}\nDinner: {d}"
#         )

#         dispatcher.utter_message(
#             text="Would you like suggestions for tomorrow?"
#         )

#         return [
#             SlotSet("conversation_mode", None)
#         ]


# # ================= WEIGHT =================

# class ActionWeightCoach(Action):

#     def name(self):
#         return "action_weight_coach"

#     def run(self, dispatcher, tracker, domain):

#         dispatcher.utter_message(
#             text="⚖️ Weight depends on calories, activity and sleep."
#         )

#         dispatcher.utter_message(
#             text="Are you aiming for fat loss or muscle gain?"
#         )

#         return []


# # ================= MOTIVATION =================

# class ActionMotivateUser(Action):

#     def name(self):
#         return "action_motivate_user"

#     def run(self, dispatcher, tracker, domain):

#         dispatcher.utter_message(
#             text="🔥 Keep going! Consistency beats perfection."
#         )

#         return []


# # ================= WEBSITE =================

# class ActionSuggestWebsite(Action):

#     def name(self):
#         return "action_suggest_website"

#     def run(self, dispatcher, tracker, domain):

#         dispatcher.utter_message(
#             text="👉 Track your diet here: https://yourwebsite.com"
#         )

#         return []



# def ask_ai(msg, mode):

#     system_prompt = f"""
# You are a friendly interactive diet assistant.

# Conversation mode = {mode}

# Rules:
# - answer simply
# - ask ONE followup
# - if mode is meal_tracking → guide user back politely
# """

#     try:
#         res = requests.post(
#             GROQ_URL,
#             headers={
#                 "Authorization": f"Bearer {GROQ_API_KEY}",
#                 "Content-Type": "application/json"
#             },
#             json={
#                 "model": "llama-3.1-8b-instant",
#                 "messages": [
#                     {"role": "system", "content": system_prompt},
#                     {"role": "user", "content": msg}
#                 ],
#                 "temperature": 0.7,
#                 "max_tokens": 120
#             }
#         )

#         return res.json()["choices"][0]["message"]["content"]

#     except:
#         return "😅 I am having a small issue right now."


# # ⭐ SET MODE

# class ActionSetMealMode(Action):

#     def name(self):
#         return "action_set_meal_mode"

#     def run(self, dispatcher, tracker, domain):

#         dispatcher.utter_message(
#             text="👍 Great! Let’s track your meals today."
#         )

#         return [
#             SlotSet("conversation_mode", "meal_tracking")
#         ]


# # ⭐ DYNAMIC AI ANSWER

# class ActionDynamicDietAnswer(Action):

#     def name(self):
#         return "action_dynamic_diet_answer"

#     def run(self, dispatcher, tracker, domain):

#         msg = tracker.latest_message.get("text")
#         mode = tracker.get_slot("conversation_mode")

#         # 🔥 STOP FORM IF USER SWITCHED TOPIC
#         if tracker.active_loop.get("name") == "diet_tracking_form":
#             return [
#                 ActiveLoop(None),
#                 SlotSet("requested_slot", None)
#             ]

#         reply = ask_ai(msg, mode)

#         dispatcher.utter_message(text=reply)

#         if mode == "meal_tracking":
#             dispatcher.utter_message(
#                 text="🙂 Do you want to continue meal tracking?"
#             )

#         return []


# # ⭐ MEAL SUMMARY

# class ActionMealSummary(Action):

#     def name(self):
#         return "action_meal_summary"

#     def run(self, dispatcher, tracker, domain):

#         b = tracker.get_slot("breakfast_status")
#         l = tracker.get_slot("lunch_status")
#         d = tracker.get_slot("dinner_status")

#         dispatcher.utter_message(
#             text=f"📊 Today summary:\nBreakfast: {b}\nLunch: {l}\nDinner: {d}"
#         )

#         dispatcher.utter_message(
#             text="Want suggestions for tomorrow?"
#         )

#         return [
#             SlotSet("conversation_mode", None)
#         ]


# # ⭐ WEIGHT

# class ActionWeightCoach(Action):

#     def name(self):
#         return "action_weight_coach"

#     def run(self, dispatcher, tracker, domain):

#         dispatcher.utter_message(
#             text="⚖️ Weight depends on calories, activity and sleep."
#         )

#         dispatcher.utter_message(
#             text="Are you aiming fat loss or muscle gain?"
#         )

#         return []


# # ⭐ MOTIVATION

# class ActionMotivateUser(Action):

#     def name(self):
#         return "action_motivate_user"

#     def run(self, dispatcher, tracker, domain):

#         dispatcher.utter_message(
#             text="🔥 Keep going! Consistency beats perfection."
#         )

#         return []


# # ⭐ WEBSITE

# class ActionSuggestWebsite(Action):

#     def name(self):
#         return "action_suggest_website"

#     def run(self, dispatcher, tracker, domain):

#         dispatcher.utter_message(
#             text="👉 Track your diet here: https://yourwebsite.com"
#         )

#         return []




# from typing import Any, Text, Dict, List
# from rasa_sdk import Action, Tracker
# from rasa_sdk.executor import CollectingDispatcher
# from rasa_sdk.events import SlotSet
# from openai import OpenAI
# import datetime
# import random


# ================= OPENAI CONFIG =================

# client = OpenAI(api_key="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")


# ================= DEMO CALORIE DATABASE =================

# CAL_DB = {
#     "biryani": 600,
#     "fish": 300,
#     "dosa": 250,
#     "rice": 400,
#     "burger": 500,
#     "pizza": 350,
#     "chicken": 450,
#     "idli": 150
# }


# def detect_food(msg):
#     msg = msg.lower()
#     for f in CAL_DB:
#         if f in msg:
#             return f
#     return None


# def ask_ai(msg):
#     res = client.chat.completions.create(
#         model="gpt-4o-mini",
#         messages=[
#             {
#                 "role": "system",
#                 "content": """
# You are a friendly diet assistant.
# Answer normally then smoothly connect to health.
# Keep reply short.
# """
#             },
#             {"role": "user", "content": msg}
#         ]
#     )
#     return res.choices[0].message.content


# class ActionAskMealByTime(Action):

#     def name(self):
#         return "action_ask_meal_by_time"

#     def run(self, dispatcher, tracker, domain):

#         h = datetime.datetime.now().hour

#         if 8 <= h <= 11:
#             q = "☀️ Good Morning! Did you have breakfast?"
#             mode = "breakfast"

#         elif 12 <= h <= 17:
#             q = "🙂 Hi! Did you take your lunch?"
#             mode = "lunch"

#         elif 18 <= h <= 20:
#             q = "👋 Had your evening snacks?"
#             mode = "snacks"

#         else:
#             q = "🌙 Good Evening! Did you take dinner?"
#             mode = "dinner"

#         dispatcher.utter_message(text=q)

#         return [SlotSet("conversation_mode", mode)]


# class ActionFoodAnalysis(Action):

#     def name(self):
#         return "action_food_analysis"

#     def run(self, dispatcher, tracker, domain):

#         msg = tracker.latest_message.get("text")
#         food = detect_food(msg)

#         total = tracker.get_slot("daily_calorie") or 0

#         if food:

#             kcal = CAL_DB[food]
#             total += kcal

#             dispatcher.utter_message(
#                 text=f"Oh nice 👍 {food} may be around {kcal} kcal."
#             )

#             if total > 1800:
#                 dispatcher.utter_message(
#                     text="🙂 I notice today calorie intake is getting high. Small changes help."
#                 )

#             dispatcher.utter_message(
#                 text="What is your body weight?"
#             )

#             return [
#                 SlotSet("daily_calorie", total),
#                 SlotSet("conversation_mode", "profiling")
#             ]

#         dispatcher.utter_message(
#             text="Nice 🙂 Try adding more vegetables for better balance."
#         )

#         return []


# class ActionMedicalAwareness(Action):

#     def name(self):
#         return "action_medical_awareness"

#     def run(self, dispatcher, tracker, domain):

#         msg = tracker.latest_message.get("text").lower()

#         if "diabetes" in msg:
#             dispatcher.utter_message(text="High carb meals may spike sugar. Add fiber.")

#         elif "bp" in msg:
#             dispatcher.utter_message(text="Reduce salt intake.")

#         elif "cholesterol" in msg:
#             dispatcher.utter_message(text="Avoid frequent oily food.")

#         dispatcher.utter_message(
#             text="Would you like simple diet improvement tips?"
#         )

#         return [SlotSet("conversation_mode", None)]


# class ActionDynamicDietAnswer(Action):

#     def name(self):
#         return "action_dynamic_diet_answer"

#     def run(self, dispatcher, tracker, domain):

#         mode = tracker.get_slot("conversation_mode")

#         msg = tracker.latest_message.get("text")

#         reply = ask_ai(msg)

#         dispatcher.utter_message(text=reply)

#         if mode:
#             dispatcher.utter_message(
#                 text="🙂 Shall we continue tracking your meals?"
#             )
#         else:
#             dispatcher.utter_message(
#                 text="🙂 What did you eat today?"
#             )

#         return []


# class ActionMealSummary(Action):

#     def name(self):
#         return "action_meal_summary"

#     def run(self, dispatcher, tracker, domain):

#         total = tracker.get_slot("daily_calorie") or 0

#         dispatcher.utter_message(
#             text=f"📊 Today approx calorie intake = {total} kcal."
#         )

#         dispatcher.utter_message(
#             text="I can help you create a simple diet plan 🙂"
#         )

#         return []


# class ActionMotivateUser(Action):

#     def name(self):
#         return "action_motivate_user"

#     def run(self, dispatcher, tracker, domain):

#         dispatcher.utter_message(
#             text="🔥 You are doing great. Small habits change health."
#         )

#         return []


# class ActionSuggestWebsite(Action):

#     def name(self):
#         return "action_suggest_website"

#     def run(self, dispatcher, tracker, domain):

#         dispatcher.utter_message(text="👉 Track meals here:")
#         dispatcher.utter_message(text="https://yourwebsite.com")

#         return []




# from typing import Any, Text, Dict, List
# from rasa_sdk import Action, Tracker
# from rasa_sdk.executor import CollectingDispatcher
# from rasa_sdk.events import SlotSet
# from openai import OpenAI
# import datetime
# import re

# # client = OpenAI(api_key="eifyhuierhfvuihegbhbrtjgnjrtngjinrfjirtknrtjk")
# client = OpenAI(api_key="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")


# # ─── SYSTEM PROMPT ────────────────────────────────────────────────────────────
# SYSTEM_PROMPT = """
# You are a friendly, smart and highly interactive AI Diet Assistant.

# Your personality:
# - Talk like a real human (warm, natural, friendly)
# - Be conversational, not robotic
# - Keep responses SHORT and engaging
# - Use emojis naturally 🙂
# - Break responses into small chat lines (2–3 lines max)
# - DO NOT use markdown symbols like * or **
# - DO NOT write long paragraphs

# --------------------------------------------------
# STRICT TIME BASED START (MANDATORY)
# --------------------------------------------------
# If conversation just started, ask ONLY ONE question based on time:

# 8am – 11am:
# Good Morning ☀️ Have you taken your breakfast?

# 12pm – 5pm:
# Hi 🙂 Have you taken your lunch?

# 6pm – 8pm:
# Hey 👋 Did you have your evening snacks?

# After 8pm:
# Good Evening 🌙 Have you taken your dinner?

# Do NOT say anything else before this.
# Wait for user reply.

# CALORIE REFERENCE (approximate only):
# Chicken biryani → ~600 kcal | Fish → ~300 kcal | Dosa → ~250 kcal
# Rice + dal → ~400 kcal | Burger → ~500 kcal | Pizza → ~350 kcal
# Idli → ~150 kcal | Chicken → ~450 kcal | Egg → ~80 kcal

# CORE FLOW — follow this step by step:
# 1. User says they ate → appreciate ("Oh nice 👍"), estimate calories, then ask ONLY body weight
# 2. User gives weight → acknowledge, ask ONLY height
# 3. User gives height → acknowledge, ask ONLY medical condition (diabetes/BP/cholesterol)
# 4. User gives medical info → give simple 1-line awareness, ask if they want diet tips
# 5. User says yes → give practical diet suggestions, mention dietician option

# HEALTH AWARENESS (keep it simple):
# - Diabetes → "High carb meals can raise blood sugar levels."
# - BP → "High salt food may increase blood pressure."
# - Cholesterol → "Oily food can increase bad cholesterol (LDL)."
# - No condition → Give positive message and encourage healthy habits

# DIET SUGGESTIONS (when asked):
# - Eat more vegetables and fruits
# - Reduce fried/oily food
# - Drink enough water daily
# - Walk at least 30 minutes daily
# - Follow a proper meal routine
# End with: "I can help you create a simple diet plan 🙂 For personalized advice, you can also connect with a dietician."

# IF USER SKIPS MEAL:
# Say: "You should not skip meals 🙂 It may reduce energy and slow your metabolism."
# Suggest: fruits, boiled eggs, sprouts, or light khichdi

# IF HIGH CALORIE FOOD IS REPEATED:
# Say gently: "I notice you are having high calorie meals frequently. Small changes can make a big difference 🙂"

# GENERAL QUESTIONS (Virat Kohli, Balasore etc.):
# Answer in 1-2 lines normally, then gently connect to diet/fitness. Example:
# "Virat Kohli is one of the fittest cricketers... If you want fitness like him, diet plays a very important role 🙂"

# LOCATION QUESTIONS:
# Answer briefly, then offer: "If you want, I can suggest healthy local food options 🙂"

# RULES — very important:
# - Sound like a human, never robotic
# - Ask ONLY ONE follow-up question at a time
# - Never repeat the same question
# - Keep answers short and clear
# - Never judge food choices
# - Never force diet topic aggressively
# - Use approximate calorie values only
# - Always maintain natural conversation flow

# You are NOT a doctor. Always give general wellness advice only.
# """



# SYSTEM_PROMPT = """
# You are a friendly, smart and highly interactive AI Diet Assistant.

# Your personality:
# - Talk like a real human (warm, natural, friendly)
# - Be conversational, not robotic
# - Keep responses SHORT and engaging
# - Use emojis naturally 🙂
# - Break responses into small chat lines (2–3 lines max)
# - DO NOT use markdown symbols like * or **
# - DO NOT write long paragraphs

# --------------------------------------------------
# STRICT TIME BASED START (MANDATORY)
# --------------------------------------------------
# If conversation just started, ask ONLY ONE question based on time:

# 8am – 11am:
# Good Morning ☀️ Have you taken your breakfast?

# 12pm – 5pm:
# Hi 🙂 Have you taken your lunch?

# 6pm – 8pm:
# Hey 👋 Did you have your evening snacks?

# After 8pm:
# Good Evening 🌙 Have you taken your dinner?

# Do NOT say anything else before this.
# Wait for user reply.

# --------------------------------------------------
# CALORIE REFERENCE (APPROXIMATE)
# --------------------------------------------------
# Chicken biryani → ~600 kcal
# Fish → ~300 kcal
# Dosa → ~250 kcal
# Rice + dal → ~400 kcal
# Burger → ~500 kcal
# Pizza → ~350 kcal
# Idli → ~150 kcal
# Chicken → ~450 kcal
# Egg → ~80 kcal

# --------------------------------------------------
# MEAL RESPONSE FLOW
# --------------------------------------------------
# If user says they ate food:

# Respond like chat:
# Oh nice 👍
# That might be around ___ kcal approximately.

# Then ask ONLY:
# What is your body weight?

# --------------------------------------------------
# STEP BY STEP FLOW
# --------------------------------------------------
# After weight:
# Got it 👍 What is your height?

# After height:
# Do you have any medical condition like diabetes, BP or cholesterol?

# --------------------------------------------------
# HEALTH AWARENESS (SHORT)
# --------------------------------------------------
# If user mentions:

# Diabetes → High carb food can increase sugar levels 🙂
# BP → High salt food may increase blood pressure 🙂
# Cholesterol → Oily food can increase bad cholesterol 🙂

# If no condition:
# Give a positive message 🙂

# Then ask:
# Do you want tips to improve your diet?

# --------------------------------------------------
# DIET SUGGESTION FLOW
# --------------------------------------------------
# If user says YES:

# Respond like chat:
# 👍 Try this:
# 🥗 Eat more vegetables
# 🚫 Reduce fried food
# 💧 Drink enough water
# 🚶 Walk daily

# Then:
# I can help you create a simple diet plan 🙂
# You can also connect with our dietician.

# --------------------------------------------------
# IF USER SKIPS MEAL
# --------------------------------------------------
# You should not skip meals 🙂
# It may reduce energy and slow metabolism

# Try:
# 🍎 Fruits
# 🥚 Boiled eggs
# 🌱 Sprouts
# 🍲 Light khichdi

# --------------------------------------------------
# HIGH CALORIE WARNING
# --------------------------------------------------
# If user eats high calorie food repeatedly:

# Say gently:
# 🙂 I notice you are having high calorie meals often.
# Small changes can make a big difference.

# --------------------------------------------------
# GENERAL QUESTIONS (GK)
# --------------------------------------------------
# If user asks general questions:

# Answer in 1–2 lines only.

# Then add:
# Fitness also depends a lot on diet 🙂

# --------------------------------------------------
# LOCATION QUESTIONS
# --------------------------------------------------
# Answer briefly, then say:
# I can also suggest healthy local food options 🙂

# --------------------------------------------------
# IMPORTANT RULES
# --------------------------------------------------
# - Ask ONLY ONE question at a time
# - NEVER repeat same question
# - Keep answers SHORT (2–3 lines max)
# - Always use chat-style responses (line by line)
# - Avoid paragraphs completely
# - Never judge user's food
# - Be helpful but not forceful
# - Maintain natural conversation flow

# --------------------------------------------------
# SAFETY
# --------------------------------------------------
# You are not a doctor.
# Always give general wellness advice only.
# """


# CAL_DB = {
#     "biryani": 600, "fish": 300, "dosa": 250, "rice": 400,
#     "burger": 500, "pizza": 350, "chicken": 450, "idli": 150,
#     "egg": 80, "khichdi": 200, "roti": 120, "dal": 150
# }

# # ─── HELPERS ──────────────────────────────────────────────────────────────────

# def detect_food(text):
#     text = text.lower()
#     for food, kcal in CAL_DB.items():
#         if food in text:
#             return food, kcal
#     return None, 0

# def extract_number(text):
#     nums = re.findall(r'\d+\.?\d*', text)
#     return float(nums[0]) if nums else None

# def build_history(tracker, limit=20):
#     """Rebuild conversation history from Rasa tracker events."""
#     history = []
#     for event in tracker.events:
#         if event.get("event") == "user":
#             text = event.get("text", "").strip()
#             if text:
#                 history.append({"role": "user", "content": text})
#         elif event.get("event") == "bot":
#             text = event.get("text", "").strip()
#             if text:
#                 history.append({"role": "assistant", "content": text})
#     return history[-limit:]  # keep last N turns to stay within token limit

# def call_gpt(tracker, extra_context="", user_override=None):
#     """
#     Call GPT-4o-mini with full conversation history.
#     extra_context: injected as a system hint so GPT knows what step we're on.
#     user_override: use this as the final user message instead of tracker's last message.
#     """
#     history = build_history(tracker)
#     messages = [{"role": "system", "content": SYSTEM_PROMPT}]

#     if extra_context:
#         messages.append({
#             "role": "system",
#             "content": f"[CONTEXT FOR THIS STEP]: {extra_context}"
#         })

#     messages += history

#     # Ensure the latest user message is included
#     latest = user_override or tracker.latest_message.get("text", "")
#     if not history or history[-1].get("content") != latest:
#         messages.append({"role": "user", "content": latest})

#     response = client.chat.completions.create(
#         model="gpt-4o-mini",
#         messages=messages,
#         max_tokens=300,
#         temperature=0.75
#     )
#     return response.choices[0].message.content.strip()

# # ─── ACTIONS ──────────────────────────────────────────────────────────────────

# class ActionAskMealByTime(Action):
#     def name(self): return "action_ask_meal_by_time"

#     def run(self, dispatcher, tracker, domain):
#         h = datetime.datetime.now().hour

#         if 8 <= h < 12:
#             msg = "Good Morning ☀️ Have you had your breakfast?"
#             mode = "breakfast"
#         elif 12 <= h < 18:
#             msg = "Hi 🙂 Have you had your lunch?"
#             mode = "lunch"
#         elif 18 <= h < 21:
#             msg = "Hey 👋 Did you have your evening snacks?"
#             mode = "snacks"
#         else:
#             msg = "Good Evening 🌙 Have you had your dinner?"
#             mode = "dinner"

#         dispatcher.utter_message(text=msg)
#         return [SlotSet("conversation_mode", mode), SlotSet("daily_calorie", 0.0)]


# class ActionFoodAnalysis(Action):
#     def name(self): return "action_food_analysis"

#     def run(self, dispatcher, tracker, domain):
#         msg = tracker.latest_message.get("text", "")
#         food, kcal = detect_food(msg)
#         total = tracker.get_slot("daily_calorie") or 0.0

#         events = []

#         if food:
#             total += kcal
#             events.append(SlotSet("daily_calorie", total))
#             extra = (
#                 f"User just said they ate {food} (~{kcal} kcal). "
#                 f"Daily total so far: {total} kcal. "
#                 f"{'Mention gently that daily intake is getting high. ' if total > 1800 else ''}"
#                 f"Appreciate the meal, mention the approximate calories, "
#                 f"then ask ONLY their body weight as the next step."
#             )
#         else:
#             extra = (
#                 "User mentioned eating something but the food wasn't identified clearly. "
#                 "Appreciate that they ate, ask what exactly they had to estimate calories, "
#                 "then proceed to ask their body weight."
#             )

#         reply = call_gpt(tracker, extra_context=extra)
#         dispatcher.utter_message(text=reply)
#         events.append(SlotSet("conversation_mode", "ask_weight"))
#         return events


# class ActionCollectWeight(Action):
#     def name(self): return "action_collect_weight"

#     def run(self, dispatcher, tracker, domain):
#         msg = tracker.latest_message.get("text", "")
#         weight = extract_number(msg)

#         extra = (
#             f"User just told their body weight ({weight} kg). "
#             f"Acknowledge it naturally and ask ONLY their height as the next step."
#         )
#         reply = call_gpt(tracker, extra_context=extra)
#         dispatcher.utter_message(text=reply)
#         return [
#             SlotSet("body_weight", weight),
#             SlotSet("conversation_mode", "ask_height")
#         ]


# class ActionCollectHeight(Action):
#     def name(self): return "action_collect_height"

#     def run(self, dispatcher, tracker, domain):
#         msg = tracker.latest_message.get("text", "")
#         height = extract_number(msg)

#         extra = (
#             f"User just told their height ({height} cm/ft). "
#             f"Acknowledge it naturally and ask ONLY if they have any medical condition "
#             f"like diabetes, BP, or cholesterol — as the next step."
#         )
#         reply = call_gpt(tracker, extra_context=extra)
#         dispatcher.utter_message(text=reply)
#         return [
#             SlotSet("height", height),
#             SlotSet("conversation_mode", "ask_medical")
#         ]


# class ActionMedicalAwareness(Action):
#     def name(self): return "action_medical_awareness"

#     def run(self, dispatcher, tracker, domain):
#         msg = tracker.latest_message.get("text", "").lower()
#         weight = tracker.get_slot("body_weight")
#         height = tracker.get_slot("height")
#         food_eaten = tracker.get_slot("daily_calorie") or 0

#         conditions = []
#         if "diabetes" in msg or "sugar" in msg: conditions.append("diabetes")
#         if "bp" in msg or "blood pressure" in msg: conditions.append("high BP")
#         if "cholesterol" in msg: conditions.append("high cholesterol")

#         extra = (
#             f"User profile: weight={weight}kg, height={height}cm, "
#             f"daily calories so far={food_eaten} kcal. "
#             f"Medical conditions: {', '.join(conditions) if conditions else 'none mentioned'}. "
#             f"Give simple 1-line health awareness for each condition. "
#             f"Then ask if they would like diet improvement tips."
#         )
#         reply = call_gpt(tracker, extra_context=extra)
#         dispatcher.utter_message(text=reply)
#         return [
#             SlotSet("medical_condition", msg),
#             SlotSet("conversation_mode", "awareness_done")
#         ]


# class ActionDietSuggestion(Action):
#     def name(self): return "action_diet_suggestion"

#     def run(self, dispatcher, tracker, domain):
#         msg = tracker.latest_message.get("text", "")
#         weight = tracker.get_slot("body_weight")
#         height = tracker.get_slot("height")
#         condition = tracker.get_slot("medical_condition") or "none"

#         extra = (
#             f"User wants diet improvement tips. "
#             f"Profile: weight={weight}kg, height={height}cm, condition={condition}. "
#             f"Give practical, personalized diet suggestions based on their profile. "
#             f"Include: more vegetables/fruits, less fried food, water intake, daily walk. "
#             f"Offer to create a simple diet plan and mention connecting with a dietician."
#         )
#         reply = call_gpt(tracker, extra_context=extra)
#         dispatcher.utter_message(text=reply)
#         return [SlotSet("conversation_mode", None)]


# class ActionSkipMeal(Action):
#     def name(self): return "action_skip_meal"

#     def run(self, dispatcher, tracker, domain):
#         msg = tracker.latest_message.get("text", "")
#         mode = tracker.get_slot("conversation_mode") or "meal"

#         extra = (
#             f"User skipped their {mode}. "
#             f"Gently tell them not to skip meals (energy/metabolism reason). "
#             f"Suggest quick healthy options: fruits, boiled eggs, sprouts, light khichdi."
#         )
#         reply = call_gpt(tracker, extra_context=extra)
#         dispatcher.utter_message(text=reply)
#         return []


# class ActionGeneralAnswer(Action):
#     def name(self): return "action_general_answer"

#     def run(self, dispatcher, tracker, domain):
#         msg = tracker.latest_message.get("text", "")
#         extra = (
#             "User asked a general knowledge question (not diet-related). "
#             "Answer it briefly in 1-2 lines, then naturally connect it back to diet or fitness."
#         )
#         reply = call_gpt(tracker, extra_context=extra)
#         dispatcher.utter_message(text=reply)
#         return []


# class ActionMealSummary(Action):
#     def name(self): return "action_meal_summary"

#     def run(self, dispatcher, tracker, domain):
#         total = tracker.get_slot("daily_calorie") or 0
#         extra = (
#             f"User's total calorie intake today: {total} kcal. "
#             f"Give a brief summary, mention if it's too high/low/balanced, "
#             f"and offer to create a diet plan."
#         )
#         reply = call_gpt(tracker, extra_context=extra)
#         dispatcher.utter_message(text=reply)
#         return []


# class ActionFallback(Action):
#     def name(self): return "action_fallback"

#     def run(self, dispatcher, tracker, domain):
#         mode = tracker.get_slot("conversation_mode")
#         extra = (
#             f"Current conversation step: {mode or 'general'}. "
#             f"User said something unexpected. Respond naturally and guide them back to the current step."
#         )
#         reply = call_gpt(tracker, extra_context=extra)
#         dispatcher.utter_message(text=reply)
#         return []








from typing import Any, Text, Dict, List
from rasa_sdk import Action, Tracker
from rasa_sdk.executor import CollectingDispatcher
from rasa_sdk.events import SlotSet
from openai import OpenAI
import datetime
import re



# client = OpenAI(api_key="YOUR_OPENAI_API_KEY_HERE")
client = OpenAI(api_key="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")

# ─── SYSTEM PROMPT ────────────────────────────────────────────────────────────
SYSTEM_PROMPT = """
You are a warm, smart and highly interactive AI Diet Assistant.
You talk like a real human friend — casual, caring, fun and helpful.

==================================================
RESPONSE FORMAT — STRICTLY FOLLOW THIS ALWAYS
==================================================
- Write like WhatsApp chat messages
- Each sentence = its own line (line breaks between every sentence)
- MAX 3 lines per reply
- Use emojis naturally in EVERY reply 🙂
- NEVER use * or ** or bullet points or markdown
- NEVER write paragraphs
- NEVER ask more than ONE question per reply
- Always sound warm and human

GOOD EXAMPLE:
Oh nice! 🍗
Chicken biryani sounds delicious!
That might be around 600 kcal approximately 🙂

BAD EXAMPLE (NEVER do this):
Chicken biryani is a delicious meal that contains approximately 600 kcal. It is important to note that this is high in carbohydrates and fats. You should consider your daily intake.

==================================================
TIME BASED GREETING — VERY IMPORTANT
==================================================
Use the exact time given to you in [CONTEXT] to decide the greeting.

5am – 11:59am → Morning greeting:
Good Morning ☀️
Have you had your breakfast?

12pm – 5:59pm → Afternoon greeting:
Hi there 🙂
Have you had your lunch?

6pm – 7:59pm → Evening greeting:
Hey 👋
Did you have your evening snacks?

8pm – 11:59pm → Night greeting:
Good Evening 🌙
Have you had your dinner?

12am – 4:59am → Late night:
Hey, you're up late! 🌙
Have you had anything to eat?

NEVER ask more than one question. Wait for user reply.

==================================================
CALORIE REFERENCE (approximate only)
==================================================
Chicken biryani → ~600 kcal
Fish → ~300 kcal
Dosa → ~250 kcal
Rice + dal → ~400 kcal
Burger → ~500 kcal
Pizza → ~350 kcal
Idli → ~150 kcal
Chicken → ~450 kcal
Egg → ~80 kcal
Roti → ~120 kcal
Dal → ~150 kcal
Khichdi → ~200 kcal
Samosa → ~250 kcal

==================================================
MEAL FLOW — STEP BY STEP (ONE QUESTION AT A TIME)
==================================================

STEP 1 — User says they ate:
Oh nice! 👍
[food name] sounds great!
That might be around [X] kcal approximately 🙂

Then ONLY ask:
What is your body weight? ⚖️

STEP 2 — User gives weight:
Got it! 💪
[acknowledge weight naturally]
What is your height? 📏

STEP 3 — User gives height:
Perfect! 🙂
[acknowledge naturally]
Do you have any medical condition like diabetes, BP or cholesterol?

STEP 4 — User gives medical condition:
[Give 1-line awareness per condition]
Diabetes → High carb meals can raise your blood sugar 🍚
BP → High salt food may raise your blood pressure 🧂
Cholesterol → Oily food can increase bad cholesterol 🍟
No condition → Amazing! You seem to be in good health 🎉

Then ask:
Would you like some tips to improve your diet? 🥗

STEP 5 — User says YES to tips:
Sure! Here are some quick tips 🙂
[give 3-4 short tip lines with emojis]
I can also help you create a simple diet plan! 🥗
For personalized advice, connect with a dietician 👨‍⚕️

==================================================
IF USER SKIPS MEAL
==================================================
Oh no, you shouldn't skip meals! 🙂
It may reduce your energy and slow metabolism.

Quick options you can try:
🍎 Fruits
🥚 Boiled eggs
🌱 Sprouts
🍲 Light khichdi

==================================================
REPEAT HIGH CALORIE FOOD
==================================================
If daily total crosses 1800 kcal, say gently:
Hey, I noticed your calorie intake is getting a bit high today 🙂
Small changes can make a big difference!
Want some tips? 🥗

==================================================
GENERAL QUESTIONS (Virat Kohli, places etc.)
==================================================
Answer in max 2 short lines.
Then connect naturally:
If you want to be fit like him, diet plays a big role 🙂

LOCATION QUESTIONS:
Answer briefly in 1-2 lines.
Then say:
Want me to suggest some healthy local food options? 🥗

==================================================
SAFETY
==================================================
You are NOT a doctor.
Always give general wellness advice only.
Never recommend medicines or treatments.
"""

CAL_DB = {
    "biryani": 600, "fish": 300, "dosa": 250, "rice": 400,
    "burger": 500, "pizza": 350, "chicken": 450, "idli": 150,
    "egg": 80, "khichdi": 200, "roti": 120, "dal": 150,
    "samosa": 250, "chapati": 120, "paratha": 300, "upma": 200,
    "poha": 180, "sandwich": 350, "noodles": 400, "pasta": 380
}

# ================= CLEAN RESPONSE =================
def send_clean(dispatcher, reply):
    reply = reply.replace("*", "").strip()
    lines = [l.strip() for l in reply.split("\n") if l.strip()]

    # limit to max 3 lines
    for line in lines[:3]:
        dispatcher.utter_message(text=line)

# ─── HELPERS ──────────────────────────────────────────────────────────────────

def get_time_context():
    """Return current hour and human-readable time slot."""
    now = datetime.datetime.now()
    h = now.hour
    time_str = now.strftime("%I:%M %p")

    if 5 <= h < 12:
        slot = "morning"
    elif 12 <= h < 18:
        slot = "afternoon"
    elif 18 <= h < 20:
        slot = "evening"
    elif 20 <= h < 24:
        slot = "night"
    else:
        slot = "late_night"

    return h, slot, time_str


def detect_food(text):
    text = text.lower()
    for food, kcal in CAL_DB.items():
        if food in text:
            return food, kcal
    return None, 0


def extract_number(text):
    nums = re.findall(r'\d+\.?\d*', text)
    return float(nums[0]) if nums else None


def build_history(tracker, limit=20):
    """Rebuild conversation history from Rasa tracker events."""
    history = []
    for event in tracker.events:
        if event.get("event") == "user":
            text = event.get("text", "").strip()
            if text:
                history.append({"role": "user", "content": text})
        elif event.get("event") == "bot":
            text = event.get("text", "").strip()
            if text:
                history.append({"role": "assistant", "content": text})
    return history[-limit:]


def call_gpt(tracker, extra_context="", user_override=None):
    """
    Call GPT-4o-mini with full conversation history + context injection.
    """
    h, slot, time_str = get_time_context()
    history = build_history(tracker)

    # Always inject current time into every call
    time_context = (
        f"Current time: {time_str} — time slot: {slot} (hour={h}). "
        f"Use this to decide greetings and meal references."
    )

    messages = [{"role": "system", "content": SYSTEM_PROMPT}]
    messages.append({"role": "system", "content": f"[TIME CONTEXT]: {time_context}"})

    if extra_context:
        messages.append({
            "role": "system",
            "content": f"[STEP CONTEXT]: {extra_context}"
        })

    messages += history

    latest = user_override or tracker.latest_message.get("text", "")
    if not history or history[-1].get("content") != latest:
        messages.append({"role": "user", "content": latest})

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=messages,
        max_tokens=200,
        temperature=0.8
    )
    return response.choices[0].message.content.strip()


# ─── ACTIONS ──────────────────────────────────────────────────────────────────

class ActionAskMealByTime(Action):
    def name(self): return "action_ask_meal_by_time"

    def run(self, dispatcher, tracker, domain):
        h, slot, time_str = get_time_context()

        # Map time slot to meal mode
        if slot == "morning":
            mode = "breakfast"
        elif slot == "afternoon":
            mode = "lunch"
        elif slot == "evening":
            mode = "snacks"
        else:
            mode = "dinner"

        extra = (
            f"Conversation just started. Current time is {time_str} ({slot}). "
            f"Send ONLY the time-based greeting question for {mode}. "
            f"Two short lines max. First line = greeting, second line = meal question. "
            f"Use the correct greeting from the system prompt for this time slot. "
            f"Do NOT ask anything else."
        )

        reply = call_gpt(tracker, extra_context=extra, user_override="[START]")
        dispatcher.utter_message(text=reply)
        return [
            SlotSet("conversation_mode", mode),
            SlotSet("daily_calorie", 0.0)
        ]


class ActionFoodAnalysis(Action):
    def name(self): return "action_food_analysis"

    def run(self, dispatcher, tracker, domain):
        msg = tracker.latest_message.get("text", "")
        food, kcal = detect_food(msg)
        total = tracker.get_slot("daily_calorie") or 0.0
        mode = tracker.get_slot("conversation_mode") or "meal"
        events = []

        if food:
            total += kcal
            events.append(SlotSet("daily_calorie", total))
            high_cal_warning = (
                "Also gently note that daily calorie intake is getting high. "
                if total > 1800 else ""
            )
            extra = (
                f"User just said they ate {food} (~{kcal} kcal) for their {mode}. "
                f"Daily calorie total so far: {total} kcal. "
                f"{high_cal_warning}"
                f"Appreciate the meal warmly, mention the approximate calories, "
                f"then ONLY ask their body weight. "
                f"Format: 3 short chat lines with emojis. No paragraphs."
            )
        else:
            extra = (
                f"User said they ate something for {mode} but the specific food wasn't clear. "
                f"Appreciate warmly that they ate, ask what exactly they had. "
                f"Keep it to 2-3 short lines with emojis."
            )

        reply = call_gpt(tracker, extra_context=extra)
        dispatcher.utter_message(text=reply)
        events.append(SlotSet("conversation_mode", "ask_weight"))
        return events


class ActionCollectWeight(Action):
    def name(self): return "action_collect_weight"

    def run(self, dispatcher, tracker, domain):
        msg = tracker.latest_message.get("text", "")
        weight = extract_number(msg)

        extra = (
            f"User just shared their body weight: {weight} kg. "
            f"Acknowledge it naturally with a short warm line. "
            f"Then ONLY ask for their height. "
            f"Format: 2 short lines with emojis. No paragraphs."
        )
        reply = call_gpt(tracker, extra_context=extra)
        dispatcher.utter_message(text=reply)
        return [
            SlotSet("body_weight", weight),
            SlotSet("conversation_mode", "ask_height")
        ]


class ActionCollectHeight(Action):
    def name(self): return "action_collect_height"

    def run(self, dispatcher, tracker, domain):
        msg = tracker.latest_message.get("text", "")
        height = extract_number(msg)
        weight = tracker.get_slot("body_weight")

        # Calculate BMI if both values available
        bmi_context = ""
        if weight and height:
            try:
                height_m = height / 100 if height > 10 else height
                bmi = round(weight / (height_m ** 2), 1)
                if bmi < 18.5:
                    bmi_label = "underweight"
                elif bmi < 25:
                    bmi_label = "normal"
                elif bmi < 30:
                    bmi_label = "overweight"
                else:
                    bmi_label = "obese"
                bmi_context = f"Their BMI is approximately {bmi} ({bmi_label}). You can mention this briefly."
            except:
                pass

        extra = (
            f"User just shared their height: {height} cm. Weight was {weight} kg. "
            f"{bmi_context} "
            f"Acknowledge naturally. "
            f"Then ONLY ask about medical conditions (diabetes, BP, cholesterol). "
            f"Format: 2-3 short lines with emojis. No paragraphs."
        )
        reply = call_gpt(tracker, extra_context=extra)
        dispatcher.utter_message(text=reply)
        return [
            SlotSet("height", height),
            SlotSet("conversation_mode", "ask_medical")
        ]


class ActionMedicalAwareness(Action):
    def name(self): return "action_medical_awareness"

    def run(self, dispatcher, tracker, domain):
        msg = tracker.latest_message.get("text", "").lower()
        weight = tracker.get_slot("body_weight")
        height = tracker.get_slot("height")
        food_eaten = tracker.get_slot("daily_calorie") or 0

        conditions = []
        if "diabetes" in msg or "sugar" in msg:
            conditions.append("diabetes")
        if "bp" in msg or "blood pressure" in msg or "hypertension" in msg:
            conditions.append("high BP")
        if "cholesterol" in msg:
            conditions.append("high cholesterol")
        if "thyroid" in msg:
            conditions.append("thyroid")

        extra = (
            f"User profile — weight: {weight}kg, height: {height}cm, "
            f"calories today: {food_eaten} kcal. "
            f"Medical conditions: {', '.join(conditions) if conditions else 'none'}. "
            f"Give ONE short awareness line per condition with emoji. "
            f"If no conditions, give a positive health message. "
            f"Then on a NEW LINE ask: Would they like diet improvement tips? "
            f"Format: short chat lines, no paragraphs, use emojis."
        )
        reply = call_gpt(tracker, extra_context=extra)
        dispatcher.utter_message(text=reply)
        return [
            SlotSet("medical_condition", ", ".join(conditions) if conditions else "none"),
            SlotSet("conversation_mode", "awareness_done")
        ]


class ActionDietSuggestion(Action):
    def name(self): return "action_diet_suggestion"

    def run(self, dispatcher, tracker, domain):
        weight = tracker.get_slot("body_weight")
        height = tracker.get_slot("height")
        condition = tracker.get_slot("medical_condition") or "none"
        total_cal = tracker.get_slot("daily_calorie") or 0

        extra = (
            f"User wants diet tips. "
            f"Profile: weight={weight}kg, height={height}cm, "
            f"condition={condition}, calories today={total_cal} kcal. "
            f"Give 4 short personalized diet tips — each on its own line with emoji. "
            f"End with offer to create a diet plan and mention dietician option. "
            f"No paragraphs. Chat style. Keep it warm and motivating."
        )
        reply = call_gpt(tracker, extra_context=extra)
        dispatcher.utter_message(text=reply)
        return [SlotSet("conversation_mode", "tips_done")]


class ActionSkipMeal(Action):
    def name(self): return "action_skip_meal"

    def run(self, dispatcher, tracker, domain):
        mode = tracker.get_slot("conversation_mode") or "meal"

        extra = (
            f"User skipped their {mode}. "
            f"Gently say they shouldn't skip meals (energy + metabolism). "
            f"Suggest 3-4 quick healthy options each on its own line with emoji. "
            f"Keep it warm, short and encouraging. No paragraphs."
        )
        reply = call_gpt(tracker, extra_context=extra)
        dispatcher.utter_message(text=reply)
        return []


class ActionGeneralAnswer(Action):
    def name(self): return "action_general_answer"

    def run(self, dispatcher, tracker, domain):
        extra = (
            "User asked a general knowledge or non-diet question. "
            "Answer briefly in 1-2 short lines with emoji. "
            "Then on a NEW LINE, naturally connect it to diet or fitness in 1 line. "
            "No paragraphs. Chat style."
        )
        reply = call_gpt(tracker, extra_context=extra)
        dispatcher.utter_message(text=reply)
        return []


class ActionMealSummary(Action):
    def name(self): return "action_meal_summary"

    def run(self, dispatcher, tracker, domain):
        total = tracker.get_slot("daily_calorie") or 0

        if total == 0:
            level = "You haven't logged any meals yet today"
        elif total < 1200:
            level = "low — you might need to eat more"
        elif total <= 2000:
            level = "balanced — great job"
        else:
            level = "a bit high — consider lighter meals next"

        extra = (
            f"User's total calorie intake today: {total} kcal ({level}). "
            f"Give a short friendly calorie summary in 2-3 chat lines with emoji. "
            f"Offer to help with a diet plan. No paragraphs."
        )
        reply = call_gpt(tracker, extra_context=extra)
        dispatcher.utter_message(text=reply)
        return []


class ActionFallback(Action):
    def name(self): return "action_fallback"

    def run(self, dispatcher, tracker, domain):
        mode = tracker.get_slot("conversation_mode") or "general"

        extra = (
            f"Current conversation step: {mode}. "
            f"User said something unexpected or unclear. "
            f"Respond naturally and warmly. "
            f"Gently guide them back to the current step if applicable. "
            f"Keep it to 2-3 short lines with emoji. No paragraphs."
        )
        reply = call_gpt(tracker, extra_context=extra)
        dispatcher.utter_message(text=reply)
        return []