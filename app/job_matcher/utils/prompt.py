from langchain_core.prompts import PromptTemplate

COMBINED_PROMPT = PromptTemplate(
    input_variables=["resume_text", "job_description"],
    template="""You are a senior talent acquisition specialist with 15 years of experience in technical recruiting. Your task is to perform a sophisticated analysis of the candidate's resume against the job description.

        ### Evaluation Framework

        1. Education Analysis
        - Assess academic credentials
        - Evaluate learning potential
        - Determine relevance to job requirements

        2. Career Trajectory Intelligence
        - Map professional growth
        - Analyze skill progression
        - Assess achievement impact
        - Understand role complexity

        ### Scoring Methodology
        - Use a nuanced, contextual matching approach
        - Provide percentage match with granular insights
        - Highlight potential and adaptability
        - Use 0-100% match scores
        - If no clear relation, use low scores (1-20%)

        ### JSON Output Structure:
        {{
            "education": {{
                "degree": "Precise Degree Title",
                "field": "Specific Field of Study",
                "university": "Full University Name",
                "year": 2023,
                "match_percentage": "X%"
            }},
            "experience": {{
                "companies": [
                    {{
                        "name": "Company Name",
                        "role": "Detailed Job Title",
                        "years": 2,
                        "key_achievements": [
                            "Specific impact-driven accomplishment",
                            "Quantifiable contribution"
                        ]
                    }}
                ],
                "total_years": 2,
                "match_percentage": "X%"
            }}
        }}

        ### Critical Processing Guidelines:
        - Demonstrate deep contextual understanding
        - Use professional, nuanced language
        - Return **only** JSON object, with no additional text
        - Be precise and concise

        ### Job Description:
        {job_description}

        ### Candidate's Resume:
        {resume_text}
        """
)

SUMMARY_RESUME_PROMPT = PromptTemplate(
    input_variables=["resume_text"],
    template = """
        Generate a concise, professional summary of this candidate's qualifications in JSON format and Extract all skills from the entire resume text, categorizing them into:
        
        Include skills from education, experience, and any section. Be exhaustive, infer skills from context (e.g., "led a team" → "leadership"), and use lowercase. Return only this JSON:
        - **hard_skills**: Technical skills (e.g., python, java, sql)
        - **tools**: Software/tools (e.g., git, docker, excel)
        - **soft_skills**: Interpersonal skills (e.g., teamwork, communication, leadership)

        {{
            "skills": {{
                "hard_skills": ["skill1", "skill2"],
                "tools": ["tool1", "tool2"],
                "soft_skills": ["skill3", "skill4"]
            }}
            "summary": "A single comprehensive paragraph that includes the candidate's title, years of experience, key skills, industry expertise, and main achievements. Do not include personal information such as name, age, gender, address, phone number, email, or photos."
        }}
        
        Ensure the summary paragraph:
        - Begins with their professional title and experience level
        - Highlights their core strengths and expertise
        - Mentions relevant industry experience
        - Notes key achievements and qualifications
        - Keeps under 150 words total
        - Forms a cohesive, readable paragraph
        
        Return ONLY valid JSON with no additional text, prefixes, or explanations.
        
        Resume:
        {resume_text}
    """
)
