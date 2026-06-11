import axios from 'axios';
import { getAuth, clearAuth } from '../../utils/Auth';
import { toast } from 'react-toastify';

const AxiosClient = axios.create({
    baseURL: `${import.meta.env.VITE_API_URL}/api`,
    timeout: 10000,
});

AxiosClient.interceptors.request.use(
    (config) => {
        const auth = getAuth();

        if (auth && auth.token) {
            config.headers.Authorization = `Bearer ${auth.token}`;
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

AxiosClient.interceptors.response.use(
    (response) => {
        return response.data;
    },
    (error) => {
        const status = error.response ? error.response.status : null;
        const message = error.response?.data?.message || 'Có lỗi xảy ra';

        if (status === 401) {
            toast.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!");
            clearAuth();
            window.location.href = '/login';
        } 
        else if (status === 403) {
            toast.error("Bạn không có quyền thực hiện hành động này!");
        }
        else if (status === 500) {
            toast.error("Lỗi hệ thống. Vui lòng thử lại sau!");
        }
        else {
            toast.error(message);
        }

        return Promise.reject(error);
    }
);

export default AxiosClient;