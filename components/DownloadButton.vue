<template>
  <button @click="saveImage" data-tooltip="download">
    <div class="icon interactive">
      <img src="~/assets/img/toolbar/save.svg" alt="" />
    </div>
  </button>
</template>

<script>
export default {
  name: "DownloadButton",
  props: {
    image: { type: String, required: true },
    title: { type: String, required: true },
    artist: String,
  },
  methods: {
    saveImage() {
      const image = new Image();
      image.src = this.image;
      image.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = image.width;
        canvas.height = image.height;
        const ctx = canvas.getContext("2d");

        ctx.imageSmoothingEnabled = ctx.mozImageSmoothingEnabled = ctx.msImageSmoothingEnabled = ctx.webkitImageSmoothingEnabled = false;
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(image, 0, 0);

        this.downloadImage(canvas);
      };
    },

    downloadImage(canvas) {
      let fileName = this.artist
        ? `exquisite corpse club-${this.title} by ${this.artist}`
        : `exquisite corpse club-${this.title}`;
      const link = document.createElement("a");
      link.download = fileName + ".png";
      canvas.toBlob(function (blob) {
        link.href = URL.createObjectURL(blob);
        link.click();
      });
    },
  },
};
</script>
