import DataService from '../../../shared/service';
import { StoreProvider } from '../../shared/store.provider';

const accountDetails = StoreProvider.getStore('App').get('accountDetails');

export const GridService = {
  getListCount(params) {
    return DataService.get(`/process/1/${accountDetails.id}/${params.modelId}/draft/count/`);
  },
  getListData(params) {
    return DataService.get(`/process/1/${accountDetails.id}/${params.modelId}/draft/?page=${params.currentPage}&per_page=${params.rowsPerPage}`, { page: params.currentPage, per_page: params.rowsPerPage });
  },
  saveData(modelId, params) {
    return DataService.post(`/process/1/${accountDetails.id}/${modelId}/draft/`, { data: params });
  },
  updateUserPreference(params) {
    return DataService.post(`/user/1/${accountDetails.id}/${params.UserId}/preference/${params.AppId}/${params.ViewType}/${params.ViewId}/`, { data: params });
  }
};
