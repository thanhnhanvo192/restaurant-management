import Customer from "../../models/customer.model.js";

//[GET] /admin /customers;
export const getCustomers = async (req, res) => {
  try {
    const customers = await Customer.find();
    res.status(200).json({ customers });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
