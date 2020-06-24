import * as fs from "fs";
import * as ejs from "ejs";

import mjml2html = require("mjml");

export const renderMJML = async (
  path: fs.PathLike,
  data: Record<string, unknown>
): Promise<string> => {
  const mjml = await fs.promises.readFile(path).then((buffer) => buffer.toString());

  const { errors, html } = mjml2html(mjml, {
    keepComments: false,
    minify: true,
    minifyOptions: {
      collapseWhitespace: true,
      minifyCSS: true,
      removeEmptyAttributes: true
    }
  });

  if (errors && errors.length) {
    throw new Error(errors.map((error) => error.message).join("\n"));
  }

  return ejs.render(html, data, { async: true });
};
