import Service, { IService } from "../models/Service";
import { NotFoundError } from "../errors/NotFoundError";
import { AppError } from "../errors/AppError";
import { generateSlug } from "../utils/generateId";
import { buildPaginationOptions, buildSearchQuery } from "../utils/pagination";
import { extractPaginationParams } from "../utils/pagination";

const getAllServices = async (queryParams: any) => {
  const params = extractPaginationParams(queryParams);
  const options = buildPaginationOptions(params);

  const filter: any = {};

  if (queryParams.category) {
    filter.category = queryParams.category;
  }

  if (queryParams.isActive !== undefined) {
    filter.isActive = queryParams.isActive === "true" || queryParams.isActive === true;
  }

  if (queryParams.isPopular !== undefined) {
    filter.isPopular = queryParams.isPopular === "true" || queryParams.isPopular === true;
  }

  if (queryParams.tags) {
    const tags = (queryParams.tags as string).split(",").map((t) => t.trim());
    filter.tags = { $in: tags };
  }

  const searchQuery = buildSearchQuery(params.search, [
    "name",
    "nameAmharic",
    "description",
    "descriptionAmharic",
  ]);

  const finalFilter = { ...filter, ...searchQuery };

  const [services, totalItems] = await Promise.all([
    Service.find(finalFilter)
      .sort(options.sort)
      .skip(options.skip)
      .limit(options.limit)
      .select("-__v")
      .lean(),
    Service.countDocuments(finalFilter),
  ]);

  return {
    services: services as unknown as IService[],
    totalItems,
    page: params.page,
    limit: params.limit,
  };
};

const getServiceById = async (id: string): Promise<IService> => {
  const service = await Service.findById(id).select("-__v");
  if (!service) {
    throw NotFoundError.service(id);
  }
  return service;
};

const getServiceBySlug = async (slug: string): Promise<IService> => {
  const service = await Service.findOne({ slug, isActive: true }).select("-__v");
  if (!service) {
    throw new NotFoundError("Service", slug);
  }
  return service;
};

const createService = async (serviceData: Partial<IService>): Promise<IService> => {
  if (!serviceData.slug) {
    serviceData.slug = generateSlug(serviceData.name || "");
  }

  const existingService = await Service.findOne({ slug: serviceData.slug });
  if (existingService) {
    throw AppError.conflict(
      `A service with the slug '${serviceData.slug}' already exists`,
      "DUPLICATE_SLUG"
    );
  }

  const service = await Service.create(serviceData);
  return service;
};

const updateService = async (id: string, updateData: Partial<IService>): Promise<IService> => {
  const service = await Service.findById(id);
  if (!service) {
    throw NotFoundError.service(id);
  }

  if (updateData.name && updateData.name !== service.name) {
    updateData.slug = generateSlug(updateData.name);
    const existingService = await Service.findOne({
      slug: updateData.slug,
      _id: { $ne: id },
    });
    if (existingService) {
      throw AppError.conflict(
        `A service with the slug '${updateData.slug}' already exists`,
        "DUPLICATE_SLUG"
      );
    }
  }

  Object.assign(service, updateData);
  await service.save();
  return service;
};

const deleteService = async (id: string): Promise<void> => {
  const service = await Service.findById(id);
  if (!service) {
    throw NotFoundError.service(id);
  }
  await Service.findByIdAndDelete(id);
};

const toggleServiceStatus = async (id: string): Promise<IService> => {
  const service = await Service.findById(id);
  if (!service) {
    throw NotFoundError.service(id);
  }
  service.isActive = !service.isActive;
  await service.save();
  return service;
};

const getPopularServices = async (limit: number = 8): Promise<IService[]> => {
  const services = await Service.find({ isActive: true, isPopular: true })
    .sort({ order: 1, name: 1 })
    .limit(limit)
    .select("name nameAmharic slug shortDescription shortDescriptionAmharic icon category")
    .lean();
  return services as unknown as IService[];
};

const getServicesByCategory = async (category: string): Promise<IService[]> => {
  const services = await Service.find({ category, isActive: true })
    .sort({ order: 1, name: 1 })
    .select("name nameAmharic slug shortDescription shortDescriptionAmharic icon fees")
    .lean();
  return services as unknown as IService[];
};

const searchServices = async (query: string, limit: number = 20): Promise<IService[]> => {
  const searchRegex = { $regex: query, $options: "i" };
  const services = await Service.find({
    isActive: true,
    $or: [
      { name: searchRegex },
      { nameAmharic: searchRegex },
      { description: searchRegex },
      { descriptionAmharic: searchRegex },
      { tags: searchRegex },
      { category: searchRegex },
    ],
  })
    .limit(limit)
    .select("name nameAmharic slug shortDescription shortDescriptionAmharic icon category")
    .lean();
  return services as unknown as IService[];
};

const getServiceCategories = async (): Promise<string[]> => {
  const categories = await Service.distinct("category", { isActive: true });
  return categories;
};

const bulkUpdateServices = async (
  ids: string[],
  updateData: Partial<IService>
): Promise<number> => {
  const result = await Service.updateMany({ _id: { $in: ids } }, { $set: updateData });
  return result.modifiedCount;
};

export {
  getAllServices,
  getServiceById,
  getServiceBySlug,
  createService,
  updateService,
  deleteService,
  toggleServiceStatus,
  getPopularServices,
  getServicesByCategory,
  searchServices,
  getServiceCategories,
  bulkUpdateServices,
};

export default {
  getAllServices,
  getServiceById,
  getServiceBySlug,
  createService,
  updateService,
  deleteService,
  toggleServiceStatus,
  getPopularServices,
  getServicesByCategory,
  searchServices,
  getServiceCategories,
  bulkUpdateServices,
};
