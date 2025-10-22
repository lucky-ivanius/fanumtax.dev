export interface License {
  key: string;

  name: string;
}

const createLicense = <TKey extends string, TName extends string>(key: TKey, name: TName) =>
  ({
    key,
    name,
  }) as const satisfies License;

export const mit = createLicense("mit", "MIT");
export const apache20 = createLicense("apache-2.0", "Apache 2.0");
export const bsd3Clause = createLicense("bsd-3-clause", "BSD 3-Clause");
export const bsd2Clause = createLicense("bsd-2-clause", "BSD 2-Clause");
export const isc = createLicense("isc", "ISC");
export const mpl20 = createLicense("mpl-2.0", "Mozilla Public License 2.0");
export const gpl30 = createLicense("gpl-3.0", "GNU General Public License 3.0");
export const gpl20 = createLicense("gpl-2.0", "GNU General Public License 2.0");
export const lgpl21 = createLicense("lgpl-2.1", "GNU Lesser General Public License 2.1");
export const lgpl30 = createLicense("lgpl-3.0", "GNU Lesser General Public License 3.0");
export const agpl30 = createLicense("agpl-3.0", "GNU Affero General Public License 3.0");
export const cc010 = createLicense("cc0-1.0", "Creative Commons Zero v1.0 Universal");
export const epl20 = createLicense("epl-2.0", "Eclipse Public License 2.0");
export const unlicense = createLicense("unlicense", "The Unlicense");

export const LICENSES = {
  [mit.key]: mit,
  [apache20.key]: apache20,
  [bsd3Clause.key]: bsd3Clause,
  [bsd2Clause.key]: bsd2Clause,
  [isc.key]: isc,
  [mpl20.key]: mpl20,
  [gpl30.key]: gpl30,
  [gpl20.key]: gpl20,
  [lgpl21.key]: lgpl21,
  [lgpl30.key]: lgpl30,
  [agpl30.key]: agpl30,
  [cc010.key]: cc010,
  [epl20.key]: epl20,
  [unlicense.key]: unlicense,
} as const;

export type LicenseKey = keyof typeof LICENSES;

export const LICENSE_LIST: (typeof LICENSES)[keyof typeof LICENSES][] = Object.values(LICENSES);
