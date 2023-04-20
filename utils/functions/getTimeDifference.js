module.exports.remainingTime = (date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();

    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const months = Math.floor(days / 30);
    const years = Math.floor(months / 12);

    const remainingMonths = months % 12;
    const remainingDays = days % 30;
    const remainingHours = hours % 24;

    return {
        years,
        remainingMonths,
        remainingDays,
        remainingHours,
    };
};

module.exports.remainingTimeString = (timeDiff) => {
    let string = '';

    switch (true) {
        case timeDiff.years > 0:
            string += `${timeDiff.years} Years `;

        case timeDiff.remainingMonths:
            string += `${timeDiff.remainingMonths} Months `;

        case timeDiff.remainingDays:
            string += `${timeDiff.remainingDays} Days `;

        case timeDiff.remainingHours:
            string += `${timeDiff.remainingHours} Hours`;
    }

    return string;
};
