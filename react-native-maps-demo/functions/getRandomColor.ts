export function getRandomColor() {
  const colors = ['#f70d1a', '#feb133', '#5e3a99', '#3c9b71', '#060f83', '#be1071'];
  return colors[Math.floor(Math.random() * colors.length)];
}