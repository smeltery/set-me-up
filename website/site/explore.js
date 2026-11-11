for (const picker of document.querySelectorAll("[data-content-picker]")) {
  const controls = picker.querySelector("fieldset");
  const panels = picker.querySelectorAll("[data-picker-panel]");
  function showSelectedPanel() {
    const selected = controls.querySelector("input:checked").value;
    for (const panel of panels) panel.hidden = panel.dataset.pickerPanel !== selected;
  }
  controls.addEventListener("change", showSelectedPanel);
  showSelectedPanel();
  controls.hidden = false;
}
