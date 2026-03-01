const completionSound = new Audio("./Assets/Sound/completion.mp3");
const errorSound = new Audio("./Assets/Sound/error.mp3");

export function playCompletionSound() {
    completionSound.currentTime = 0;
    completionSound.play();
}

export function playErrorSound() {
    errorSound.currentTime = 0;
    errorSound.play();
}