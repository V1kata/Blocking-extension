function getTime() {
    let currentDate = new Date();
    let currentHour = currentDate.getHours();
    let currentMinutes = currentDate.getMinutes();
    let formattedTime = `${String(currentHour).padStart(2, '0')}:${String(currentMinutes).padStart(2, '0')}`;

    return formattedTime;
}

function hourToMinutes(userInput) {
    // Get the current time
    let currentDate = new Date();
    let currentHour = currentDate.getHours();
    let currentMinutes = currentDate.getMinutes();
    let currentTimeInMinutes = currentHour * 60 + currentMinutes;

    // Assume the user input is in the format "HH:mm"
    let [userInputHour, userInputMinutes] = userInput.split(":");
    let userInputTimeInMinutes = parseInt(userInputHour) * 60 + parseInt(userInputMinutes);

    return currentTimeInMinutes >= userInputTimeInMinutes
}