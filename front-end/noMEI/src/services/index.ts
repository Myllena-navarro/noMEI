export { fetchLicitacoes } from './licitacoesService';
export type { FetchLicitacoesParams } from './licitacoesService';

export { uploadDocumento, listarDocumentos } from './documentosService';
export type { Documento, DocumentoStatus, DocumentoListResponse } from './documentosService';

export {
  login,
  register,
  refreshTokens,
  forgotPassword,
  resetPassword,
  storeTokens,
  getAccessToken,
  getRefreshToken,
  clearTokens,
} from './authService';
export type { TokenResponse } from './authService';

export { fetchAlertas } from './alertasService';
export type { Alerta, AlertaListResponse, AlertaType } from './alertasService';

export { fetchMinhaPerfil, saveMinhaPerfil } from './perfilService';
export type { PerfilResponse, PerfilCreate } from './perfilService';
