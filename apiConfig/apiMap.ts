import axios from "axios";

const API_KEY = "JgyBcd5fd6G1Cg3TEfjTx39IaqElsZDFLVO8jKP2";

/**
 * Lấy danh sách quận/huyện trong Hồ Chí Minh
 * @returns {Promise<any>}
 */
export const fetchDistricts = async (): Promise<any[]> => {
  try {
    const response = await axios.get(
      `https://provinces.open-api.vn/api/p/79?depth=2`
    );
    return response.data.districts;
  } catch (err) {
    console.error("Error fetching districts:", err);
    throw new Error("Failed to fetch districts.");
  }
};

/**
 * Lấy danh sách phường/xã trong một quận
 * @param {string} districtId - Mã quận
 * @returns {Promise<any[]>}
 */
export const fetchWards = async (districtId: string): Promise<any[]> => {
  try {
    const response = await axios.get(
      `https://provinces.open-api.vn/api/d/${districtId}?depth=2`
    );
    return response.data.wards;
  } catch (err) {
    console.error("Error fetching wards:", err);
    throw new Error("Failed to fetch wards.");
  }
};

/**
 * Gợi ý địa chỉ 
 * @param {string} input - Địa chỉ cần gợi ý
 * @returns {Promise<any>}
 */
export const fetchAddressSuggestions = async (input: string): Promise<any[]> => {
  try {
    const response = await axios.get(
      `https://rsapi.goong.io/Place/AutoComplete`,
      {
        params: {
          api_key: API_KEY,
          location: "10.77609,106.69508", 
          input,
        },
      }
    );
    return response.data.predictions;
  } catch (err) {
    console.error("Error fetching address suggestions:", err);
    throw new Error("Failed to fetch address suggestions.");
  }
};
export const getHotDistricts = async (): Promise<any[]> => {
  try {
    const response = await axios.get('http://192.168.20.76:5000/api/hotdistric');
    const data = response.data.data;
    if (Array.isArray(data)) {
      // Assuming each item in the data has a districtCode and percentage
      return data.map((district: any) => ({
        name: district.name, // Adjust according to your API's response
        percentage: district.percentage, // Adjust according to your API's response
      }));
    } else {
      console.error('Expected an array but received:', data);
      return [];
    }
  } catch (error) {
    console.error('Error fetching hot districts:', error);
    return [];
  }
};
