export interface CueCard {
  id: string;
  topic: string;
  points: string[];
  modelAnswer: string;
  followUps: {
    question: string;
    answer: string;
  }[];
}

export const IELTS_SPEAKING_TOPICS: CueCard[] = [
  {
    id: "adv-useful",
    topic: "Describe an advertisement that you think is very useful.",
    points: [
      "Where it was",
      "What was it about",
      "Why you think it's useful"
    ],
    modelAnswer: "I'd like to tell you about an advertisement for an online learning platform called 'Coursera' that I encountered recently. I first saw this advertisement while scrolling through my YouTube feed. It was a short, well-produced video featuring success stories of individuals who had transformed their careers through the platform.\n\nThe advertisement was primarily about the diverse range of professional courses and certifications available, particularly in cutting-edge fields like Data Science and UX Design. It highlighted the flexibility of the platform, showing how people could learn at their own pace despite having busy full-time jobs.\n\nI believe this advertisement is extremely useful for a few reasons. Firstly, it provides high-quality information about accessible education. In today's rapidly changing job market, knowing where to find credible upskilling resources is crucial. Secondly, it was inspiring rather than just 'pushy.' Instead of just selling a product, it showcased real-world impact. For someone like me, who is always looking to expand my horizons, it acted as a practical guide to the next step in my professional development.",
    followUps: [
      {
        question: "What do you think of advertisements online?",
        answer: "Online advertisements are a double-edged sword. On one hand, they can be highly targeted and helpful, showing us products or services we actually need. On the other hand, they can be intrusive and sometimes misleading if not properly regulated."
      },
      {
        question: "Do you think there are too many advertisements nowadays?",
        answer: "Yes, definitely. We are constantly bombarded with ads on social media, billboards, and even in our emails. This 'ad fatigue' often leads people to use ad-blockers or simply ignore the messaging altogether."
      },
      {
        question: "How do you feel about children seeing advertisements?",
        answer: "I think there should be strict regulations. Children are impressionable and may not distinguish between entertainment and commercial persuasion. Ads for unhealthy foods or expensive toys can create unnecessary pressure on parents."
      }
    ]
  },
  {
    id: "good-news",
    topic: "Describe a piece of good news you heard from others.",
    points: [
      "What the news was",
      "When you heard it",
      "How you felt about it"
    ],
    modelAnswer: "I recently heard some wonderful news from my elder sister. Last month, she called me to share that she had finally been awarded a full scholarship to pursue her Master's degree in Architecture in London.\n\nI remember receiving the call on a quiet Saturday afternoon. She was so excited her voice was literally trembling. She had been working on her portfolio and applications for over a year, facing several rejections along the way, so this was the culmination of a lot of hard work and perseverance.\n\nI felt absolutely overjoyed and incredibly proud of her. Seeing someone you love achieve a long-held dream is a special kind of happiness. It also served as a great motivation for me, reminding me that persistence eventually pays off. We celebrated as a family that evening, and the atmosphere was filled with positivity and hope for her future.",
    followUps: [
      {
        question: "How do people usually share good news in your country?",
        answer: "In my country, news is mostly shared through phone calls or instant messaging apps like WhatsApp. For very big news, like a wedding or a new baby, families often host a small gathering or dinner to share the joy in person."
      },
      {
        question: "What kind of good news do people like to hear most?",
        answer: "Generally, people love hearing about personal achievements like graduations and promotions, or life milestones like engagements and birth announcements. Health-related good news is also always very well-received."
      }
    ]
  },
  {
    id: "product-happy",
    topic: "Describe a product you bought and felt happy with.",
    points: [
      "What it was",
      "Where you bought it",
      "Why it made you happy"
    ],
    modelAnswer: "A product I recently purchased that has brought me a lot of satisfaction is a pair of noise-canceling headphones from Sony. I bought them from a local electronics store during their year-end sale last December.\n\nI had been researching various models for months because I often work in noisy cafes or travel on loud public transport. The moment I tried them on, I was amazed by how effectively they muted the world around me. They are sleek, comfortable, and the battery life is exceptional.\n\nThese headphones made me happy because they significantly improved my productivity and mental well-being. Being able to create a 'silent bubble' wherever I am allows me to focus deeply on my work or enjoy my favorite music without distraction. It was a classic example of a purchase that genuinely added value to my daily quality of life.",
    followUps: [
      {
        question: "Do you think people spend too much money on gadgets?",
        answer: "Often, yes. Many people feel pressured to upgrade to the latest model every year even if their current device works perfectly. This leads to unnecessary spending and electronic waste."
      },
      {
        question: "Should we buy things we need or things we want?",
        answer: "Ideally, we should prioritize our needs, but it's also important to occasionally treat ourselves to things we want if they bring us genuine happiness or utility. The key is balance and mindful spending."
      }
    ]
  },
  {
    id: "team-exp",
    topic: "Describe an experience you had as a member of a team.",
    points: [
      "What the experience was",
      "Who was in the team",
      "How you felt about it"
    ],
    modelAnswer: "One of the most memorable team experiences I've had was organizing a charity bake sale during my final year of university. The team consisted of five close friends, each bringing a different skill to the table—one was great at marketing, another at finance, and some of us focused on the 'logistics' of baking and setup.\n\nWe spent weeks planning the event, coordinating with the campus administration, and reaching out to local sponsors for ingredients. On the day of the sale, it was quite stressful as we were overwhelmed with customers, but we communicated effectively and supported each other through the rush.\n\nI felt a deep sense of accomplishment and camaraderie. Working toward a common goal for a good cause strengthened our friendship and taught me the importance of clear communication and delegating tasks. We ended up raising over $1,000 for a local orphanage, which made the whole experience incredibly rewarding.",
    followUps: [
      {
        question: "Is it better to work alone or in a team?",
        answer: "It depends on the task. For creative or complex projects, a team often produces better results through diverse perspectives. However, for tasks requiring deep focus or quick decision-making, working alone can sometimes be more efficient."
      },
      {
        question: "What qualities make a good team leader?",
        answer: "A good leader should be a great listener, be able to motivate others, and have the ability to remain calm under pressure. Most importantly, they should lead by example and be fair in their treatment of all team members."
      }
    ]
  },
  {
    id: "person-welcome",
    topic: "Describe a person who is good at making people feel welcome.",
    points: [
      "Who the person is",
      "How you know them",
      "What they do to make people feel welcome"
    ],
    modelAnswer: "I immediately think of my aunt, Maria. She is my mother's younger sister, and she has always been the heart of our extended family gatherings. I've known her my entire life, and her house is practically my second home.\n\nWhat makes her special is her warmth and attention to detail. Every time someone walks through her door, regardless of whether they are family or a complete stranger, she greets them with a genuine smile and an enthusiastic hug. She has an intuitive ability to remember everyone's favorite drink or snack, and she makes sure they have it ready within minutes of their arrival.\n\nBeyond food and drink, she is an active listener. She asks thoughtful questions and truly focuses on what you're saying, which makes you feel seen and valued. She avoids controversial topics and instead fosters an atmosphere of inclusivity and laughter. Whenever I'm at her place, I feel completely relaxed and 'at home,' which I think is the ultimate sign of a great host.",
    followUps: [
      {
        question: "Do you think hospitality is important in your culture?",
        answer: "Yes, it's a cornerstone of our culture. We believe that a guest brings a blessing into the home, so we go above and beyond to ensure they are comfortable and well-fed. It's a matter of family pride."
      },
      {
        question: "How has technology changed the way we socialize?",
        answer: "Technology has made it easier to stay in touch across long distances, but it has sometimes made face-to-face interactions feel less 'present' because people are often distracted by their phones. However, it also allows us to coordinate large gatherings much more easily than before."
      }
    ]
  }
];
