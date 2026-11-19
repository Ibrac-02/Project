import { useState } from 'react'
import { LightbulbIcon } from '../icons/Icons'
import './StudyTips.css'

const STUDY_TIPS = [
  'Use active recall: test yourself instead of just re-reading.',
  'Space out your study sessions over time for better retention.',
  'Teach concepts to others to reinforce your understanding.',
  'Take regular breaks to keep your mind fresh and focused.',
  'Create visual mind maps to connect related ideas.',
  'Practice past exam papers under timed conditions.',
  'Get enough sleep — it consolidates what you learned.',
  'Stay hydrated and eat brain-boosting foods.',
]

export default function StudyTips() {
  const [tip] = useState(() => STUDY_TIPS[Math.floor(Math.random() * STUDY_TIPS.length)])

  return (
    <section className="study-tips" aria-labelledby="study-tips-heading">
      <div className="study-tips__header">
        <h2 id="study-tips-heading" className="section-heading">
          <LightbulbIcon width={20} height={20} />
          Study Tips
        </h2>
      </div>
      <div className="study-tips__card">
        <p className="study-tips__tip">{tip}</p>
      </div>
    </section>
  )
}
