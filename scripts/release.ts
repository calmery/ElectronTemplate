"use strict";

import * as fs from "fs";
import * as path from "path";
import * as electronBuilder from "electron-builder";

// Package Json

interface PackageConfiguration {
  name: string;
  version: string;
  description: string;
  author:
    | {
        name: string;
        email: string;
      }
    | string;
}

const readPackageConfiguration = (): Promise<PackageConfiguration> => {
  return new Promise((resolve, reject) => {
    fs.readFile(
      path.resolve(__dirname, "../package.json"),
      "utf-8",
      (error, contents: string) => {
        if (error !== null) {
          return reject(error);
        }

        try {
          return resolve(JSON.parse(contents));
        } catch (error) {
          return reject(error);
        }
      }
    );
  });
};

// NOTE: 基本的にパッケージはバンドル済みであるため，必要となるプロパティのみを切り出して出力する
const writePackageConfiguration = (
  packageConfiguration: PackageConfiguration
) => {
  return new Promise((resolve, reject) => {
    fs.writeFile(
      path.resolve(__dirname, "../build/package.json"),
      JSON.stringify({
        name: packageConfiguration.name,
        version: packageConfiguration.version,
        author: packageConfiguration.author,
        description: packageConfiguration.description,
        // NOTE: build フォルダをルートとして使用するため `build/main` ではなく `main` になる
        main: "main"
      }),
      error => {
        if (error) {
          return reject(error);
        }

        return resolve();
      }
    );
  });
};

// Build

// NOTE: https://www.electron.build/configuration/win
const buildForWindows = async (packageConfiguration: PackageConfiguration) => {
  const { build, Platform } = electronBuilder;

  await build({
    targets: Platform.WINDOWS.createTarget("nsis", electronBuilder.Arch.ia32),
    config: {
      // NOTE: `AbcXyz` を `Abc Xyz` とする
      productName: packageConfiguration.name.match(/[A-Z][a-z]+/g).join(" "),
      // NOTE: GitHub Releases に登録しないようにする
      publish: null,
      directories: {
        app: path.resolve(__dirname, "../build"),
        output: path.resolve(__dirname, "../release")
      },
      icon: path.resolve(__dirname, "../icons/icon.ico")
    }
  });
};

// NOTE: https://www.electron.build/configuration/mac
const buildForMacOS = async (packageConfiguration: PackageConfiguration) => {
  const { build, Platform } = electronBuilder;

  await build({
    targets: Platform.MAC.createTarget(),
    config: {
      // NOTE: `AbcXyz` を `Abc Xyz` とする
      productName: packageConfiguration.name.match(/[A-Z][a-z]+/g).join(" "),
      // NOTE: GitHub Releases に登録しないようにする
      publish: null,
      directories: {
        app: path.resolve(__dirname, "../build"),
        output: path.resolve(__dirname, "../release")
      },
      // NOTE: http://www.img2icnsapp.com/
      icon: path.resolve(__dirname, "../icons/icon.icns")
    }
  });
};

// Main

(async () => {
  try {
    const packageConfiguration = await readPackageConfiguration();
    await writePackageConfiguration(packageConfiguration);
    await buildForWindows(packageConfiguration);
    await buildForMacOS(packageConfiguration);

    console.log("Build Successful");
  } catch (error) {
    console.log("Build Error");
    console.log(error.message || error.code || error);
  }
})();
