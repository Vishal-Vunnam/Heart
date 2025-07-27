export function getRandomColor() {
  const colors = ['red', 'orange', 'purple', 'green', 'blue', 'red', 'pink'];
  return colors[Math.floor(Math.random() * colors.length)];
}