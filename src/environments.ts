import * as string from "../.env";

interface Environments {
  [key: string]: any;
}

export default (() => {
  const environments = {};

  // NOTE: https://github.com/motdotla/dotenv/blob/c1645c96aa8dcd2dbe5f9b086a8164166f2806f2/lib/main.js#L31-L63
  string
    .toString()
    .split("\n")
    .forEach((line: string) => {
      const keyValueArray = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);

      if (keyValueArray != null) {
        const key = keyValueArray[1];
        let value = keyValueArray[2] || "";
        const length = value ? value.length : 0;
        if (
          length > 0 &&
          value.charAt(0) === '"' &&
          value.charAt(length - 1) === '"'
        ) {
          value = value.replace(/\\n/gm, "\n");
        }
        value = value.replace(/(^['"]|['"]$)/g, "").trim();
        environments[key] = value;
      }
    });

  return environments;
})() as Environments;
