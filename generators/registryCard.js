const {
createCanvas,
loadImage
} = require("@napi-rs/canvas");

const path = require("path");

function toRoman(num) {

const values = [
    [1000, "M"],
    [900, "CM"],
    [500, "D"],
    [400, "CD"],
    [100, "C"],
    [90, "XC"],
    [50, "L"],
    [40, "XL"],
    [10, "X"],
    [9, "IX"],
    [5, "V"],
    [4, "IV"],
    [1, "I"]
];

let result = "";

for (const [value, numeral] of values) {

    while (num >= value) {
        result += numeral;
        num -= value;
    }
}

return result;

}

async function generateRegistry(data) {

const allHeirs = [
    ...data.heirs,
    ...data.reservedHeirs
];

const rowHeight = 90;
const firstHeirY = 850;
const footerSpace = 150;

const canvasHeight = 5000;
    console.log(
    "Canvas Height:",
    canvasHeight
);
const canvas = createCanvas(
    1800,
    canvasHeight
);

const ctx = canvas.getContext("2d");

const logo = await loadImage(
    path.join(__dirname, "../assets/logo.png")
);

const banner = await loadImage(
    path.join(__dirname, "../assets/banner.png")
);

// Background

ctx.fillStyle = "#050505";
ctx.fillRect(0, 0, 1800, canvasHeight);

// Banner

ctx.drawImage(
    banner,
    0,
    0,
    1800,
    450
);

// Divider

ctx.strokeStyle = "#D4AF37";
ctx.lineWidth = 2;

ctx.beginPath();
ctx.moveTo(0, 450);
ctx.lineTo(1800, 450);
ctx.stroke();

// Sidebar

ctx.fillStyle = "#0F0F0F";
ctx.fillRect(
    0,
    451,
    450,
    canvasHeight - 450
);

ctx.strokeStyle = "#D4AF37";

// Logo

ctx.drawImage(
    logo,
    20,
    500,
    450,
    400
);

// Sovereign

ctx.fillStyle = "#D4AF37";
ctx.font = "bold 45px Times New Roman";

ctx.fillText(
    "THE SOVEREIGN",
    40,
    1050
);

ctx.fillStyle = "#FFFFFF";
ctx.font = "40px Times New Roman";

ctx.fillText(
    "Rylee Celestia Ivanovich",
    40,
    1100
);

// Motto

ctx.fillStyle = "#C8B37A";
ctx.font = "italic 55px Times New Roman";

ctx.fillText(
    "We don't chase power, we're born to rule.",
    720,
    510
);

// Footer

ctx.fillStyle = "#B58A2D";
ctx.font = "italic 55px Times New Roman";

ctx.fillText(
    "Bloodline Above All.",
    1200,
    canvasHeight - 50
);

// Section Title

ctx.fillStyle = "#D4AF37";
ctx.font = "bold 80px Times New Roman";

ctx.fillText(
    "THE HEIRS",
    510,
    700
);

ctx.beginPath();
ctx.moveTo(510, 740);
ctx.lineTo(1700, 740);
ctx.strokeStyle = "#D4AF37";
ctx.lineWidth = 2;
ctx.stroke();

// Heirs

allHeirs.forEach((heir, index) => {

    const y =
        firstHeirY +
        (index * rowHeight);

    ctx.fillStyle = "#D4AF37";
    ctx.font = "bold 65px Times New Roman";

    ctx.fillText(
        toRoman(index + 1),
        480,
        y
    );

    ctx.fillStyle = "#FFFFFF";
    ctx.font = "70px Times New Roman";

    ctx.fillText(
    heir.name,
    720,
    y
); 

});

return canvas.encode("png");

}

module.exports = {
generateRegistry
};
