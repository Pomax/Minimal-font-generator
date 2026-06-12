const create = (tag, innerHTML, classes) => {
  const e = document.createElement(tag);
  e.innerHTML = innerHTML;
  if (classes) {
    Object.assign(e.style, classes);
  }
  return e;
};

let counter = 0;

function useCharacter() {
  const dyn = document.getElementById(`dynamic`);
  const character = document.getElementById("character").value;
  const str = character.repeat(5);
  const font = TinyFontGenerator.generateFont(character);
  const fontname = "BespokeFont-" + counter++;

  // add an @font-face rule for this bespoke font
  document.head.append(
    create(
      `style`,
      `@font-face {
               font-family: "${fontname}";
               src: url("data:application/x-font-ttf;base64,${font}") format('truetype');
            }`,
    ),
  );

  // add a div with that character, styled with the bespoke font
  dyn.append(
    create(
      `div`,
      `「${str}」 typeset using our custom font (this should look like an empty string!): <span style="font-family: '${fontname}';">${str}</span>`,
      {
        backgroundColor: "#E0D5F0",
        padding: "2px",
        margin: "5px",
        border: "1px solid grey",
      },
    ),
  );

  // for good measure, what's the font's bytecode?
  dyn.append(create(`div`, `Base64 code of the bespoke font used:`));
  dyn.append(create(`textarea`, font, { width: `60em`, height: `10em` }));
}
