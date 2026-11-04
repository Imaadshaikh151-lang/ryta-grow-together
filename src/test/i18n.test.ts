import { describe, expect, it } from "vitest";
import { dictionaries, translate } from "@/lib/i18n";
import { WORK_TYPES, AVAILABILITY } from "@/lib/store";

describe("localization", () => {
  it("Kannada has every English key, none empty", () => {
    for (const k of Object.keys(dictionaries.en)) {
      expect(dictionaries.kn[k as keyof typeof dictionaries.kn]?.trim(), k).toBeTruthy();
    }
  });
  it("the three roles use the exact agreed names", () => {
    expect(translate("en", "role.owner")).toBe("Farm owner");
    expect(translate("en", "role.agent")).toBe("Labour agent");
    expect(translate("en", "role.labourer")).toBe("Independent labourer");
  });
  it("every work type and availability option has a translation", () => {
    for (const w of WORK_TYPES) expect(dictionaries.kn[`work.${w}`]).toBeTruthy();
    for (const a of AVAILABILITY) expect(dictionaries.kn[`avail.${a}`]).toBeTruthy();
  });
  it("fills placeholders", () => {
    expect(translate("en", "job.confirmedOf", { c: 2, n: 5 })).toBe("2/5 confirmed");
  });
});
