import { useState } from "react";
import { Dumbbell, Apple, Heart, Target, ChevronDown, ChevronUp, Flame, Moon, ShoppingCart, Calendar, Star, Trophy } from "lucide-react";

function Section({ icon: Icon, title, color, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between p-5 hover:bg-gray-800/50 transition-all"
      >
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${color}`}>
            <Icon className="w-5 h-5 text-black" />
          </div>
          <span className="text-white font-bold text-base">{title}</span>
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
      </button>
      {open && <div className="px-5 pb-5 space-y-3 border-t border-gray-800 pt-4">{children}</div>}
    </div>
  );
}

function Tag({ children, color = "bg-gray-800 text-gray-300" }) {
  return <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${color}`}>{children}</span>;
}

function MacroBar({ label, value, max, color, unit = "g" }) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-gray-400">{label}</span>
        <span className="text-white font-bold">{value}{unit}</span>
      </div>
      <div className="h-2.5 bg-gray-800 rounded-full">
        <div className={`h-2.5 rounded-full transition-all ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export default function BodyGoalPlanDisplay({ plan, referenceImage, onReset }) {
  const dayTypeColors = {
    strength: "bg-purple-500/20 text-purple-300 border-purple-700",
    cardio: "bg-red-500/20 text-red-300 border-red-700",
    hiit: "bg-orange-500/20 text-orange-300 border-orange-700",
    mobility: "bg-green-500/20 text-green-300 border-green-700",
    rest: "bg-gray-700/20 text-gray-400 border-gray-700",
  };

  return (
    <div className="space-y-5">
      {/* Hero Card */}
      <div className="bg-gradient-to-br from-vellera-blue/20 to-vellera-green/20 border border-vellera-blue/40 rounded-2xl p-5">
        {referenceImage && (
          <img src={referenceImage} alt="Target" className="w-full max-h-40 object-cover rounded-xl mb-4 opacity-80" />
        )}
        <div className="flex items-center gap-2 mb-2">
          <Trophy className="w-5 h-5 text-vellera-green" />
          <span className="text-xs font-bold text-vellera-blue uppercase tracking-widest">Your Transformation Plan</span>
        </div>
        <h2 className="text-white font-black text-xl leading-snug mb-2">{plan.plan_title}</h2>
        <p className="text-gray-300 text-sm leading-relaxed">{plan.overview}</p>
        <div className="flex gap-3 mt-4">
          <div className="bg-black/30 rounded-xl px-3 py-2 text-center flex-1">
            <p className="text-vellera-green font-black text-lg">{plan.timeline}</p>
            <p className="text-gray-400 text-xs">Timeline</p>
          </div>
          {plan.body_composition_targets && (
            <>
              <div className="bg-black/30 rounded-xl px-3 py-2 text-center flex-1">
                <p className="text-vellera-blue font-black text-lg">{plan.body_composition_targets.target_body_fat}</p>
                <p className="text-gray-400 text-xs">Target BF%</p>
              </div>
              <div className="bg-black/30 rounded-xl px-3 py-2 text-center flex-1">
                <p className="text-yellow-400 font-black text-lg">{plan.body_composition_targets.expected_fat_loss_lbs}</p>
                <p className="text-gray-400 text-xs">Fat Loss</p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Nutrition / Macros */}
      {plan.nutrition_plan && (
        <Section icon={Apple} title="Nutrition & Macros" color="bg-vellera-green" defaultOpen>
          <div className="bg-black/30 rounded-xl p-4 space-y-3">
            <div className="flex justify-between items-center mb-1">
              <span className="text-gray-400 text-sm">Daily Calories</span>
              <span className="text-white font-black text-xl">{plan.nutrition_plan.daily_calories} kcal</span>
            </div>
            <MacroBar label="Protein" value={plan.nutrition_plan.protein_g} max={300} color="bg-vellera-blue" />
            <MacroBar label="Carbs" value={plan.nutrition_plan.carbs_g} max={400} color="bg-yellow-400" />
            <MacroBar label="Fat" value={plan.nutrition_plan.fat_g} max={150} color="bg-orange-400" />
          </div>
          {plan.nutrition_plan.meal_timing && (
            <div className="bg-gray-800 rounded-xl p-3">
              <p className="text-xs text-vellera-blue font-bold mb-1">Meal Timing Strategy</p>
              <p className="text-gray-300 text-sm">{plan.nutrition_plan.meal_timing}</p>
            </div>
          )}
          {plan.nutrition_plan.meals?.map((meal, i) => (
            <div key={i} className="bg-gray-800 rounded-xl p-3">
              <div className="flex justify-between items-center mb-1">
                <span className="text-white font-bold text-sm">{meal.name}</span>
                <div className="flex gap-2">
                  <Tag color="bg-vellera-blue/20 text-vellera-blue">{meal.calories} cal</Tag>
                  <Tag color="bg-purple-500/20 text-purple-300">{meal.protein_g}g protein</Tag>
                </div>
              </div>
              <p className="text-gray-500 text-xs">{meal.time}</p>
              <ul className="mt-2 space-y-0.5">
                {meal.foods?.map((f, j) => <li key={j} className="text-gray-300 text-xs">• {f}</li>)}
              </ul>
            </div>
          ))}
          {plan.nutrition_plan.pre_workout_meal && (
            <div className="bg-vellera-green/10 border border-vellera-green/30 rounded-xl p-3">
              <p className="text-xs text-vellera-green font-bold mb-1">⚡ Pre-Workout</p>
              <p className="text-gray-300 text-sm">{plan.nutrition_plan.pre_workout_meal}</p>
            </div>
          )}
          {plan.nutrition_plan.post_workout_meal && (
            <div className="bg-vellera-blue/10 border border-vellera-blue/30 rounded-xl p-3">
              <p className="text-xs text-vellera-blue font-bold mb-1">🔄 Post-Workout</p>
              <p className="text-gray-300 text-sm">{plan.nutrition_plan.post_workout_meal}</p>
            </div>
          )}
          {plan.nutrition_plan.foods_to_prioritize?.length > 0 && (
            <div>
              <p className="text-xs text-gray-400 font-bold mb-2">Foods to Prioritize</p>
              <div className="flex flex-wrap gap-2">
                {plan.nutrition_plan.foods_to_prioritize.map((f, i) => (
                  <Tag key={i} color="bg-green-900/40 text-green-300">✓ {f}</Tag>
                ))}
              </div>
            </div>
          )}
          {plan.nutrition_plan.foods_to_avoid?.length > 0 && (
            <div>
              <p className="text-xs text-gray-400 font-bold mb-2">Foods to Limit/Avoid</p>
              <div className="flex flex-wrap gap-2">
                {plan.nutrition_plan.foods_to_avoid.map((f, i) => (
                  <Tag key={i} color="bg-red-900/40 text-red-300">✕ {f}</Tag>
                ))}
              </div>
            </div>
          )}
          {plan.nutrition_plan.supplements?.length > 0 && (
            <div>
              <p className="text-xs text-gray-400 font-bold mb-2">Recommended Supplements</p>
              <div className="space-y-2">
                {plan.nutrition_plan.supplements.map((s, i) => (
                  <div key={i} className="flex items-start justify-between bg-gray-800 rounded-lg px-3 py-2">
                    <div>
                      <p className="text-white text-sm font-bold">{s.name}</p>
                      <p className="text-gray-400 text-xs">{s.dose} · {s.timing}</p>
                      <p className="text-gray-500 text-xs italic">{s.purpose}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Section>
      )}

      {/* Weekly Training Schedule */}
      {plan.weekly_schedule?.length > 0 && (
        <Section icon={Dumbbell} title="Weekly Training Schedule" color="bg-purple-400" defaultOpen>
          <div className="space-y-4">
            {plan.weekly_schedule.map((day, i) => (
              <div key={i} className="bg-gray-800 rounded-xl overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 bg-gray-750">
                  <div>
                    <span className="text-white font-black">{day.day}</span>
                    <span className="text-gray-400 text-sm ml-2">— {day.focus}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Tag color={dayTypeColors[day.type] || "bg-gray-700 text-gray-300"}>{day.type}</Tag>
                    <span className="text-gray-500 text-xs">{day.duration_minutes}min</span>
                  </div>
                </div>
                {day.exercises?.length > 0 && (
                  <div className="px-4 py-3 space-y-2">
                    {day.exercises.map((ex, j) => (
                      <div key={j} className="border-l-2 border-gray-700 pl-3">
                        <div className="flex justify-between items-center">
                          <p className="text-white text-sm font-bold">{ex.name}</p>
                          <span className="text-vellera-blue text-xs font-bold">{ex.sets}×{ex.reps}</span>
                        </div>
                        {ex.rest_seconds && <p className="text-gray-500 text-xs">Rest: {ex.rest_seconds}s</p>}
                        {ex.tip && <p className="text-vellera-green text-xs italic mt-0.5">💡 {ex.tip}</p>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Cardio Plan */}
      {plan.cardio_plan && (
        <Section icon={Flame} title="Cardio Plan" color="bg-red-400">
          <div className="bg-gray-800 rounded-xl p-4 space-y-2">
            <div className="grid grid-cols-3 gap-3 text-center">
              <div><p className="text-white font-black">{plan.cardio_plan.frequency_per_week}×</p><p className="text-gray-400 text-xs">Per Week</p></div>
              <div><p className="text-white font-black">{plan.cardio_plan.duration_minutes}min</p><p className="text-gray-400 text-xs">Duration</p></div>
              <div><p className="text-vellera-green font-black text-sm">{plan.cardio_plan.intensity}</p><p className="text-gray-400 text-xs">Intensity</p></div>
            </div>
            <p className="text-gray-300 text-sm border-t border-gray-700 pt-3">{plan.cardio_plan.type}</p>
            {plan.cardio_plan.notes && <p className="text-gray-400 text-xs italic">{plan.cardio_plan.notes}</p>}
          </div>
        </Section>
      )}

      {/* Meal Prep */}
      {plan.weekly_meal_prep && (
        <Section icon={ShoppingCart} title="Weekly Meal Prep" color="bg-yellow-400">
          <div className="bg-gray-800 rounded-xl p-4">
            <div className="flex gap-4 mb-3">
              <div className="text-center"><p className="text-white font-black">{plan.weekly_meal_prep.prep_day}</p><p className="text-gray-400 text-xs">Prep Day</p></div>
              <div className="text-center"><p className="text-white font-black">{plan.weekly_meal_prep.prep_duration_hours}hrs</p><p className="text-gray-400 text-xs">Duration</p></div>
            </div>
            {plan.weekly_meal_prep.batch_cook_items?.length > 0 && (
              <div className="mb-3">
                <p className="text-xs text-gray-400 font-bold mb-2">Batch Cook These</p>
                {plan.weekly_meal_prep.batch_cook_items.map((item, i) => (
                  <p key={i} className="text-gray-300 text-sm">• {item}</p>
                ))}
              </div>
            )}
            {plan.weekly_meal_prep.sample_weekly_grocery_list?.length > 0 && (
              <div>
                <p className="text-xs text-gray-400 font-bold mb-2">Grocery List</p>
                <div className="grid grid-cols-2 gap-1">
                  {plan.weekly_meal_prep.sample_weekly_grocery_list.map((item, i) => (
                    <p key={i} className="text-gray-300 text-xs">• {item}</p>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Section>
      )}

      {/* Recovery */}
      {plan.recovery_protocol && (
        <Section icon={Moon} title="Recovery Protocol" color="bg-blue-400">
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div className="bg-gray-800 rounded-xl p-3 text-center">
              <p className="text-white font-black text-xl">{plan.recovery_protocol.sleep_target_hours}hrs</p>
              <p className="text-gray-400 text-xs">Sleep Target</p>
            </div>
            <div className="bg-gray-800 rounded-xl p-3 text-center">
              <p className="text-white font-black text-xl">{plan.recovery_protocol.mobility_minutes_daily}min</p>
              <p className="text-gray-400 text-xs">Daily Mobility</p>
            </div>
          </div>
          {plan.recovery_protocol.key_recovery_habits?.map((habit, i) => (
            <div key={i} className="flex items-start gap-2 bg-gray-800 rounded-lg px-3 py-2">
              <Heart className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
              <p className="text-gray-300 text-sm">{habit}</p>
            </div>
          ))}
        </Section>
      )}

      {/* Phase Breakdown */}
      {plan.phase_breakdown?.length > 0 && (
        <Section icon={Calendar} title="Phase Breakdown" color="bg-vellera-blue">
          <div className="space-y-3">
            {plan.phase_breakdown.map((phase, i) => (
              <div key={i} className="bg-gray-800 rounded-xl p-4 border-l-4 border-vellera-blue">
                <p className="text-vellera-blue font-bold text-sm mb-1">{phase.phase}</p>
                <p className="text-white text-sm font-bold mb-1">{phase.focus}</p>
                <p className="text-gray-400 text-xs">{phase.key_adjustments}</p>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Pro Tips */}
      {plan.pro_tips?.length > 0 && (
        <Section icon={Star} title="Pro Tips & Success Keys" color="bg-vellera-green">
          <div className="space-y-2">
            {plan.pro_tips.map((tip, i) => (
              <div key={i} className="flex items-start gap-3 bg-gray-800 rounded-lg px-3 py-2.5">
                <span className="text-vellera-green font-black text-sm">{i + 1}</span>
                <p className="text-gray-300 text-sm leading-relaxed">{tip}</p>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Success Metrics */}
      {plan.success_metrics?.length > 0 && (
        <div className="bg-gradient-to-r from-vellera-blue/10 to-vellera-green/10 border border-vellera-blue/30 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <Target className="w-5 h-5 text-vellera-green" />
            <p className="text-white font-bold">Track These Metrics</p>
          </div>
          <div className="space-y-1">
            {plan.success_metrics.map((m, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-vellera-green" />
                <p className="text-gray-300 text-sm">{m}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <button
        onClick={onReset}
        className="w-full py-4 border border-gray-700 text-gray-300 font-bold rounded-xl hover:border-gray-500 transition-all"
      >
        Generate a New Plan
      </button>
    </div>
  );
}