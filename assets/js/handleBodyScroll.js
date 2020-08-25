import { disableBodyScroll } from "body-scroll-lock";

export function handleBodyScroll(container) {
  disableBodyScroll(container, {
    allowTouchMove: (el) => {
      console.log(el);
      return (
        el.tagName === "CANVAS" ||
        el.tagName === "BUTTON" ||
        el.tagName === "LABEL" ||
        el.tagName === "INPUT" ||
        el.tagName === "A" ||
        el.classList.contains("pointer") ||
        el.classList.contains("interactive")
      );
    },
  });
}
