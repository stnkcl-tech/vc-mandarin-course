from __future__ import annotations

"""Mock question generator — fallback when AI API is unavailable."""

import random
from typing import Any


def generate_mock_questions(
    selected_days: list[int],
    config_dict: dict[str, Any],
) -> dict[str, Any]:
    """Generate demo questions when the AI API is unavailable."""

    questions: list[dict[str, Any]] = []
    qid = 1

    def next_id() -> str:
        nonlocal qid
        i = f"q_{qid}"
        qid += 1
        return i

    # Build a pool of contextual content based on selected days
    day_context = f"Days {', '.join(map(str, selected_days))}" if selected_days else "General review"
    difficulty = config_dict.get("difficulty", "Beginner")

    # Speaking questions
    if config_dict.get("includeSpeaking"):
        speaking_prompts = [
            {
                "prompt": f"Introduce yourself in Mandarin. Mention your name, nationality, and one hobby. Use the grammar point: 是 (shì).",
                "tips": ["Use 我是… to introduce yourself", "Mention at least 3 pieces of information", "Speak clearly and at natural pace"],
                "explanation": "A strong self-introduction uses 我是 [name], 我是 [nationality]人, and 我喜欢 [hobby]. Keep tones clear and speak at natural pace.",
            },
            {
                "prompt": f"Describe your daily routine from morning to evening. Include at least 4 different activities with specific times.",
                "tips": ["Use time expressions: 早上, 中午, 晚上", "Connect activities with 然后, 以后", "Minimum target: 5–6 sentences"],
                "explanation": "Daily routines flow best with time markers: 早上七点我起床，然后洗澡，以后吃早饭. Use 然后 for sequence and 以后 for 'after that'.",
            },
            {
                "prompt": f"Talk about your family. Mention at least 3 family members, their relationship to you, and one fact about each person.",
                "tips": ["Use 的 after pronouns: 我的妈妈, 他的工作", "Include ages or occupations if you know them", "Minimum target: 4–5 sentences"],
                "explanation": "Family descriptions rely on 的 as a possessive particle: 我的妈妈 is 'my mother'. Mentioning age (今年…岁) or job (他是医生) adds detail.",
            },
        ]
        for sp in speaking_prompts[:2]:
            questions.append({
                "id": next_id(),
                "type": "speaking",
                "section": "Speaking",
                "prompt": sp["prompt"],
                "sourceDay": random.choice(selected_days) if selected_days else 1,
                "maxDuration": 120,
                "tips": sp["tips"],
                "explanation": sp["explanation"],
            })

    # Reading questions
    if config_dict.get("includeReadingComprehension"):
        readings = [
            {
                "passage": "我叫李明。我是大学生。每天早上七点起床，然后洗澡、吃早饭。八点我去上课。中午十二点我和朋友一起吃饭。下午我常常去图书馆。晚上我看书或者看电影。十一点睡觉。",
                "passagePinyin": "Wǒ jiào Lǐ Míng. Wǒ shì dàxuéshēng. Měitiān zǎoshang qī diǎn qǐchuáng, ránhòu xǐzǎo, chī zǎofàn. Bā diǎn wǒ qù shàngkè. Zhōngwǔ shí'èr diǎn wǒ hé péngyǒu yìqǐ chīfàn. Xiàwǔ wǒ chángcháng qù túshūguǎn. Wǎnshang wǒ kànshū huòzhě kàn diànyǐng. Shíyī diǎn shuìjiào.",
                "question": "What does Li Ming do at 12 PM?",
                "options": [
                    {"id": "a", "text": "He goes to class"},
                    {"id": "b", "text": "He eats with friends"},
                    {"id": "c", "text": "He goes to the library"},
                    {"id": "d", "text": "He watches movies"},
                ],
                "correctOptionId": "b",
                "explanation": "The passage states: 中午十二点我和朋友一起吃饭 ('At 12 noon I eat together with friends'), so the correct answer is B.",
            },
            {
                "passage": "王方是我的好朋友。她是医生，在医院工作。她每天很忙，但是很喜欢自己的工作。她的爱好是看书和旅行。",
                "passagePinyin": "Wáng Fāng shì wǒ de hǎo péngyǒu. Tā shì yīshēng, zài yīyuàn gōngzuò. Tā měitiān hěn máng, dànshì hěn xǐhuan zìjǐ de gōngzuò. Tā de àihào shì kànshū hé lǚxíng.",
                "question": "What is Wang Fang's profession?",
                "options": [
                    {"id": "a", "text": "Teacher"},
                    {"id": "b", "text": "Doctor"},
                    {"id": "c", "text": "Student"},
                    {"id": "d", "text": "Engineer"},
                ],
                "correctOptionId": "b",
                "explanation": "The passage says 她是医生 ('She is a doctor') and 在医院工作 ('works in a hospital'), so the correct answer is B.",
            },
        ]
        for r in readings:
            questions.append({
                "id": next_id(),
                "type": "reading",
                "section": "Reading Comprehension",
                "prompt": r["question"],
                "sourceDay": random.choice(selected_days) if selected_days else 1,
                "passage": r["passage"],
                "passagePinyin": r["passagePinyin"],
                "options": r["options"],
                "correctOptionId": r["correctOptionId"],
                "hasAudioNarration": False,
                "explanation": r["explanation"],
            })

    # Character writing
    if config_dict.get("includeCharacterWriting"):
        chars = [
            {"character": "家", "pinyin": "jiā", "meaning": "home / family", "strokeCount": 10, "etymology": "宀 (roof) + 豕 (pig) = traditional family home", "explanation": "家 combines 宀 (roof) and 豕 (pig) — in ancient China, a pig under the roof represented a prosperous family home. Remember: top first, then the inside strokes."},
            {"character": "我", "pinyin": "wǒ", "meaning": "I / me", "strokeCount": 7, "explanation": "我 is one of the first characters every learner writes. Start with the top-left 丿 stroke, then the horizontal hook 𠄌."},
            {"character": "好", "pinyin": "hǎo", "meaning": "good", "strokeCount": 6, "etymology": "女 (woman) + 子 (child) = good/complete", "explanation": "好 is 女 (woman) + 子 (child) — the idea that a woman with a child represents completeness and goodness. Left side first, then right."},
            {"character": "学", "pinyin": "xué", "meaning": "to learn / study", "strokeCount": 8, "explanation": "学 has the 子 (child) component at the bottom, representing a child learning under a roof. Top dots first, then the cover, then 子."},
            {"character": "朋", "pinyin": "péng", "meaning": "friend", "strokeCount": 8, "explanation": "朋 is two 月 (moon) side by side — the classical view that friends stand together like two moons. Write left 月 first, then right 月."},
        ]
        for c in chars[:3]:
            questions.append({
                "id": next_id(),
                "type": "writing-character",
                "section": "Character Writing",
                "prompt": "Write this character from memory:",
                "sourceDay": random.choice(selected_days) if selected_days else 1,
                **c,
            })

    # Essay
    if config_dict.get("includeShortEssay"):
        questions.append({
            "id": next_id(),
            "type": "writing-essay",
            "section": "Essay Composition",
            "prompt": f"Topic: Write about your best friend (150–200 characters)",
            "sourceDay": random.choice(selected_days) if selected_days else 1,
            "topic": "Write about your best friend",
            "minChars": 150,
            "maxChars": 200,
            "requirements": [
                "Use at least 3 descriptive adjectives",
                "Use 比 (comparison) at least once",
                "Mention how you met and one activity you do together",
            ],
            "template": "我的好朋友叫______。他/她______。我们______认识，因为______。他/她比我很______。我们常常一起______。我觉得他/她非常______。",
            "explanation": "A strong essay introduces your friend with 我的好朋友叫…, describes them with adjectives (漂亮, 聪明, 善良), uses 比 for comparison, and includes a shared activity. Aim for natural flow between sentences.",
        })

    return {
        "questions": questions,
        "metadata": {
            "module": f"Mock Session — {difficulty} — {day_context}",
            "estimatedDuration": len(questions) * 5,
            "questionCount": len(questions),
            "mockMode": True,
        },
    }
