const { NativeFunction, ArgType } = require("@tryforge/forgescript");
const { createCanvas, loadImage, GlobalFonts } = require("@napi-rs/canvas");
const { AttachmentBuilder } = require("discord.js");

GlobalFonts.registerFromPath("./src/fonts/Poppins.ttf", "Poppins");

module.exports.default = new NativeFunction({
  name: "$makeCanvas",
  version: "1.0.0",
  description: "Draws the quote image",
  brackets: true,
  unwrap: true,
  args: [
    {
      name: "name",
      description: "The image name",
      rest: false,
      required: true,
      type: ArgType.String,
    },
    {
      name: "author",
      description: "The author",
      rest: false,
      required: true,
      type: ArgType.User,
    },
    {
      name: "content",
      description: "The quote content",
      rest: true,
      required: true,
      type: ArgType.String,
    },
  ],
  async execute(ctx, [name, author, content]) {
    let ratio = [16, 9];
    let defaultScale = 45;
    let scale = 20;
    let width = ratio[0] * defaultScale;
    let height = ratio[1] * defaultScale;
    let canvas = createCanvas(width, height);

    let colors = {
      primary: ctx.client.defaults.colors.quoteBgMain,
      secondary: ctx.client.defaults.colors.quoteBgSecondary,
      dark: ctx.client.defaults.colors.quoteBgDark,
    };

    let ct = canvas.getContext("2d");

    /* Gradient top-left to bottom-right */
    let gradient = ct.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, colors.secondary);
    gradient.addColorStop(1, colors.primary);
    ct.fillStyle = gradient;
    ct.fillRect(0, 0, width, height);

    /* Gradient bottom-right to top-left */
    let offset = defaultScale;
    gradient = ct.createLinearGradient(
      offset,
      offset,
      width + offset,
      height + offset,
    );
    gradient.addColorStop(0, `rgba(${rgb(colors.primary).join(", ")}, 0.2)`);
    gradient.addColorStop(1, colors.dark);
    ct.fillStyle = gradient;
    ct.fillRect(0, 0, width, height);

    /* ----------- */

    let userAvatar = author.displayAvatarURL({
      size: 4096,
      format: "png",
      dynamic: true,
    });
    let avatar = await loadImage(userAvatar);

    let f = 10;
    let fadeLength = Math.round(height + f);
    let newFadeCanvas = createCanvas(fadeLength, fadeLength);
    let newFadeCtx = newFadeCanvas.getContext("2d");
    gradient = newFadeCtx.createLinearGradient(
      0,
      fadeLength * 0.5,
      fadeLength,
      fadeLength * 0.5,
    );
    gradient.addColorStop(0.1, "rgba(255, 255, 255, 1)");
    gradient.addColorStop(1, "rgba(255, 255, 255, 0)");

    newFadeCtx.drawImage(avatar, 0, -f, fadeLength, fadeLength);
    newFadeCtx.fillStyle = `rgba(0, 0, 0, 0.55)`;
    newFadeCtx.fillRect(0, -f, fadeLength, fadeLength);
    newFadeCtx.globalCompositeOperation = "destination-in";
    newFadeCtx.fillStyle = gradient;
    newFadeCtx.fillRect(0, -f, fadeLength, fadeLength);
    newFadeCtx.globalCompositeOperation = "source-over";
    ct.drawImage(newFadeCanvas, 0, -f, fadeLength, fadeLength + f);

    let avatarSize = Math.round(Math.min(width, height) * 0.56);
    let imageX = Math.round(0.08 * width);
    let imageY = height / 2 - avatarSize / 2;
    let averageColor = (await getAverageColor(avatar)).join(", ");
    let borderWidth = 8;

    ct.save();
    ct.beginPath();
    ct.arc(
      imageX + avatarSize / 2,
      imageY + avatarSize / 2,
      avatarSize / 2,
      0,
      Math.PI * 2,
    );
    ct.clip();
    ct.drawImage(avatar, imageX, imageY, avatarSize, avatarSize);
    ct.closePath();
    ct.restore();
    ct.save();
    ct.beginPath();
    ct.arc(
      imageX + avatarSize / 2,
      imageY + avatarSize / 2,
      avatarSize / 2 + borderWidth,
      0,
      Math.PI * 2,
    );
    ct.strokeStyle = `rgb(${averageColor})`;
    ct.lineWidth = borderWidth;
    ct.stroke();
    ct.closePath();
    ct.restore();

    let textX = imageX + avatarSize + 4 * f;
    let textCanvas = createCanvas(width - textX, height);
    let textCtx = textCanvas.getContext("2d");
    let text = `"${content.join(";")}"`;
    let maxTextWidth = textCanvas.width - 2 * f;
    let fontSize = Math.round(scale * 0.5) + f;
    textCtx.font = `${fontSize}px Poppins`;
    textCtx.textAlign = "left";
    textCtx.textBaseline = "top";
    textCtx.fillStyle = "white";
    let words = text
      .split(" ")
      .map((x) => x.split("\n").map((x, y) => (y ? ["\n", x] : [x])))
      .flat()
      .flat();
    let textx = f;
    let texty = f;
    let line = "";
    let newWidth = 0;
    for (let i = 0; i < words.length; i++) {
      let testLine = line + words[i] + " ";
      let metrics = textCtx.measureText(testLine);
      let testWidth = metrics.width;
      if ((testWidth > maxTextWidth && i > 0) || words[i] == "\n") {
        textCtx.fillText(line, textx, texty);
        texty += fontSize + 3;
        line = words[i] == "\n" ? "" : words[i] + " ";
        textx = f;
        newWidth =
          words[i] == "\n" ? Math.max(newWidth, testWidth) : maxTextWidth;
      } else {
        line = testLine;
        newWidth = Math.max(newWidth, testWidth);
      }
    }
    textCtx.fillText(line, textx, texty);

    /* Crop the canvas' height to (texty + fontSize + 3 + f) */
    let croppedCanvas = createCanvas(
      newWidth + 2 * f,
      texty + fontSize + 3 + f,
    );
    let croppedCtx = croppedCanvas.getContext("2d");
    croppedCtx.drawImage(textCanvas, 0, 0);

    console.log(croppedCanvas.width + "x" + croppedCanvas.height);

    ct.drawImage(
      croppedCanvas,
      newWidth !== maxTextWidth
        ? textX + croppedCanvas.width - newWidth
        : textX,
      height / 2 - croppedCanvas.height / 2,
    );

    ct.save();
    let inwards = scale * 0.5;
    ct.lineJoin = "round";
    ct.lineWidth = Math.round(inwards * 0.55);
    ct.shadowColor = colors.dark;
    ct.shadowBlur = 10;
    ct.strokeStyle = colors.dark;
    ct.strokeRect(inwards, inwards, width - 2 * inwards, height - 2 * inwards);
    ct.restore();
    let att = new AttachmentBuilder(canvas.toBuffer("image/png"), { name });
    ctx.container.files.push(att);
    return this.success();
  },
});

function rgb(hex) {
  let r = parseInt(hex.slice(1, 3), 16);
  let g = parseInt(hex.slice(3, 5), 16);
  let b = parseInt(hex.slice(5, 7), 16);
  return [r, g, b];
}

async function getAverageColor(image) {
  let canvas = createCanvas(image.width, image.height);
  let ctx = canvas.getContext("2d");
  ctx.drawImage(image, 0, 0, image.width, image.height);
  let imageData = ctx.getImageData(0, 0, image.width, image.height);
  let data = imageData.data;
  let avg = [0, 0, 0];
  for (let i = 0; i < data.length; i += 4) {
    avg[0] += data[i];
    avg[1] += data[i + 1];
    avg[2] += data[i + 2];
  }
  avg[0] /= data.length / 4;
  avg[1] /= data.length / 4;
  avg[2] /= data.length / 4;
  return avg.map((c) => Math.round(c));
}

async function wrapText(context, text, maxWidth) {
  let words = text.split(" ");
  let line = "";
  let newtext = "";

  for (let i = 0; i < words.length; i++) {
    let testLine = line + words[i] + " ";
    let metrics = context.measureText(testLine);
    let testWidth = metrics.width;
    if (testWidth > maxWidth && i > 0) {
      newtext += testLine;
      newtext += "\n";
      line = words[i] + " ";
    } else {
      line = testLine;
    }
  }
  console.log(newtext + "\n" + line);
  return newtext + "\n" + line;
}
