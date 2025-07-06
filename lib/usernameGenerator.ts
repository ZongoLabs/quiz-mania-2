
const adjectives = ["Quick", "Bright", "Clever", "Wise", "Swift", "Brave", "Calm", "Eager", "Keen", "Jolly"];
const nouns = ["Panda", "Tiger", "Eagle", "Lion", "Fox", "Wolf", "Hawk", "Shark", "Bear", "Jaguar"];

export const generateUsername = (): string => {
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  const num = Math.floor(Math.random() * 900) + 100;
  return `${adj}${noun}${num}`;
};
