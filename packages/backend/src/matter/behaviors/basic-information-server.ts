import { BridgedDeviceBasicInformationServer as Base } from "@matter/main/behaviors";
import crypto from "node:crypto";
import { HomeAssistantBehavior } from "../custom-behaviors/home-assistant-behavior.js";
import { VendorId } from "@matter/main";
import { HomeAssistantEntityState } from "@home-assistant-matter-hub/common";
import { applyPatchState } from "../../utils/apply-patch-state.js";

export class BasicInformationServer extends Base {
  override async initialize(): Promise<void> {
    await super.initialize();
    const homeAssistant = await this.agent.load(HomeAssistantBehavior);
    this.update(homeAssistant.entity);
    this.reactTo(homeAssistant.onChange, this.update);
  }

  private update(entity: HomeAssistantEntityState) {
    const homeAssistant = this.agent.get(HomeAssistantBehavior);
    const { basicInformation } = homeAssistant.state;
    applyPatchState(this.state, {
      vendorId: VendorId(basicInformation.vendorId),
      vendorName: maxLengthOrHash(basicInformation.vendorName, 32),
      productName: maxLengthOrHash(basicInformation.productName, 32),
      productLabel: maxLengthOrHash(basicInformation.productLabel, 64),
      hardwareVersion: basicInformation.hardwareVersion,
      softwareVersion: basicInformation.softwareVersion,
      nodeLabel: maxLengthOrHash(
        entity.attributes.friendly_name ?? entity.entity_id,
        32,
      ),
      reachable: entity.state !== "unavailable",
    });
  }
}

function maxLengthOrHash(value: string, maxLength: number): string {
  if (maxLength < 16) {
    throw new Error("MaxLength cannot be shorter than 16");
  }
  if (value.length <= maxLength) {
    return value;
  } else {
    const hash = crypto
      .createHash("md5")
      .update(value)
      .digest("hex")
      .substring(0, 4);
    return value.substring(0, maxLength - 4) + hash;
  }
}
