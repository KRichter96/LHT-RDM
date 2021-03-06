export class PartModel {
  counterId: number;
  parentId = '-1';
  nomenclature = '';
  category = '';
  componentType = '';
  ipcReference = '';
  ipcItemNumber = '';
  preModPNIPC = '';
  preModPositionIPC = '';
  arrangement = '';
  ammRemovalTask = '';
  ammInstallTask = '';
  intendedPurpose = '';
  aupa = '';
  installZoneRoom = '';
  reasonRemoval = '';
  preModPNAC = '';
  preModPositionAC = '';
  serialNo = '';
  existingComponents = '';
  preModWeight = '';
  rackNo = '';
  rackLocation = '';
  remarksRemoval = '';
  postModPN = '';
  postModPosition = '';
  modDWG = '';
  panelPNAVI = '';
  integrCompPN = '';
  integrCompTypes = '';
  equipNo = '';
  integratedComponents = '';
  postModWeight = '';
  remarksMod = '';
  cmmReference = '';
  xxx = '';
  moC0 = '';
  moC1 = '';
  moC2 = '';
  testSample = '';
  moC4Flameability = '';
  moC7 = '';
  deleteReason = '';
  statusCreate = '';
  statusEdit = '';
  id: string;
  projectId: string;

  // frontend only
  complete: boolean;
  isSynchronized = false;
}


export function setStatus(part: PartModel) {
  part.complete = part.rackLocation &&
    part.rackNo &&
    part.preModWeight &&
    part.preModWeight !== 'N/A' &&
    part.rackLocation !== 'N/A' &&
    part.rackNo !== 'N/A';
}
