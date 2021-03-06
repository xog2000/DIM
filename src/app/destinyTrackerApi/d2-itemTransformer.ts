import * as _ from 'underscore';
import { compact } from '../util';
import { DestinyVendorSaleItemComponent } from 'bungie-api-ts/destiny2';
import { D2Item } from '../inventory/item-types';
import { getPowerMods } from '../inventory/store/d2-item-factory.service';
import { DtrD2BasicItem, D2ItemFetchRequest } from '../item-review/d2-dtr-api-types';

/**
 * Translate a DIM item into the basic form that the DTR understands an item to contain.
 * This does not contain personally-identifying information.
 * Meant for fetch calls.
 */
export function translateToDtrItem(item: D2Item | DestinyVendorSaleItemComponent): D2ItemFetchRequest {
  return {
    referenceId: isVendorSaleItem(item) ? item.itemHash : item.hash
  };
}

/**
 * Get the roll and perks for the selected DIM item (to send to the DTR API).
 * Will contain personally-identifying information.
 */
export function getRollAndPerks(item: D2Item): DtrD2BasicItem {
  const powerModHashes = getPowerMods(item).map((m) => m.hash);
  return {
    selectedPerks: getSelectedPlugs(item, powerModHashes),
    attachedMods: powerModHashes,
    referenceId: item.hash,
    instanceId: item.id,
  };
}

function getSelectedPlugs(item: D2Item, powerModHashes: number[]): number[] {
  if (!item.sockets) {
    return [];
  }

  const allPlugs = compact(item.sockets.sockets.map((i) => i.plug).map((i) => i && i.plugItem.hash));

  return _.difference(allPlugs, powerModHashes);
}

function isVendorSaleItem(item: D2Item | DestinyVendorSaleItemComponent): item is DestinyVendorSaleItemComponent {
  return (item as DestinyVendorSaleItemComponent).itemHash !== undefined;
}
