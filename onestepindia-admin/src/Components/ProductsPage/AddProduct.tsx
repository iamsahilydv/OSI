import React, { useState, useContext, useEffect } from "react";
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Select,
  Switch,
  VStack,
  HStack,
  Text,
  useToast,
  Card,
  CardBody,
  CardHeader,
  Heading,
  Divider,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  IconButton,
  Image,
  SimpleGrid,
  Badge,
  Alert,
  AlertIcon,
  CloseButton,
  Flex,
  Grid,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Spinner,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
} from "@chakra-ui/react";
import { AddIcon, DeleteIcon, ViewIcon, EditIcon } from "@chakra-ui/icons";
import AuthToast from "../Toast";
import LoginContext from "../../context/Login/LoginContext";
import { authInstance } from "../../Axios/Axios";

// Types
interface Category {
  id: string;
  name: string;
}

interface CategoryAttribute {
  id: number;
  attribute_name: string;
  attribute_type: "text" | "number" | "select" | "boolean" | "color" | "size";
  is_required: boolean;
  options?: string[];
  display_order: number;
}

interface CategoryTemplate {
  category_id: number;
  attributes: CategoryAttribute[];
}

// Original clothing variation interface
interface ClothingVariation {
  sku: string;
  size: string;
  color: string;
  qikink_sku?: string;
  qikink_price?: number;
  selling_price: number;
  is_available: boolean;
  print_type_id?: string;
  design_code?: string;
  design_link?: string;
  mockup_link?: string;
  placement_sku?: string;
  images?: string[];
}

// New multi-category variation interface
interface MultiCategoryVariation {
  sku: string;
  variation_name: string;
  attributes: Record<string, any>;
  selling_price: number;
  stock_quantity: number;
  is_available: boolean;
  images: string[];
}

interface ColorImages {
  [colorName: string]: string[];
}

interface ProductFormData {
  name: string;
  description: string;
  qty: number;
  category_id: string;
  brand: string;
  sellby: string;
  is_pod: boolean;
  productImages: string[];
  // Support both variation types
  variations: ClothingVariation[] | MultiCategoryVariation[];
  colorImages: ColorImages;
  // New fields for multi-category
  selectedCategory?: number;
  currentAttributes?: Record<string, any>;
  categoryTemplate?: CategoryTemplate;
}

interface AddProductProps {
  categories: Category[];
}

// Constants
const SIZE_OPTIONS = ["XS", "S", "M", "L", "XL", "XXL", "One Size"];
const COLOR_OPTIONS = [
  "Black",
  "White",
  "Blue",
  "Red",
  "Green",
  "Yellow",
  "Pink",
  "Purple",
  "Orange",
  "Brown",
  "Gray",
  "Gold",
  "Silver",
];

const INITIAL_CLOTHING_VARIATION: ClothingVariation = {
  sku: "",
  size: "",
  color: "",
  qikink_sku: "",
  qikink_price: 0,
  selling_price: 0,
  is_available: true,
  print_type_id: "",
  design_code: "",
  design_link: "",
  mockup_link: "",
  placement_sku: "",
  images: [],
};

const INITIAL_MULTI_CATEGORY_VARIATION: MultiCategoryVariation = {
  sku: "",
  variation_name: "",
  attributes: {},
  selling_price: 0,
  stock_quantity: 0,
  is_available: true,
  images: [],
};

const INITIAL_FORM_DATA: ProductFormData = {
  name: "",
  description: "",
  qty: 1,
  category_id: "",
  brand: "",
  sellby: "",
  is_pod: false,
  productImages: [],
  variations: [],
  colorImages: {},
};

// Category Selector Component
const CategorySelector: React.FC<{
  selectedCategory?: number;
  onCategoryChange: (categoryId: number) => void;
  onAttributesChange?: (attributes: Record<string, any>) => void;
}> = ({ selectedCategory, onCategoryChange, onAttributesChange }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedTemplate, setSelectedTemplate] =
    useState<CategoryTemplate | null>(null);
  const [attributeValues, setAttributeValues] = useState<Record<string, any>>(
    {}
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (selectedCategory) {
      fetchCategoryTemplate(selectedCategory);
    }
  }, [selectedCategory]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await authInstance.get("/allCategory");
      if (response.data.success) {
        setCategories(response.data.categories);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      setError("Failed to fetch categories");
    } finally {
      setLoading(false);
    }
  };

  const fetchCategoryTemplate = async (categoryId: number) => {
    try {
      setLoading(true);
      setError(null);
      const response = await authInstance.get(
        `/category-template/${categoryId}`
      );
      if (response.data.success) {
        setSelectedTemplate(response.data.template);
        setAttributeValues({});
        onAttributesChange?.({});
      }
    } catch (error) {
      console.error("Error fetching category template:", error);
      setError("Failed to fetch category template");
    } finally {
      setLoading(false);
    }
  };

  const handleAttributeChange = (attributeName: string, value: any) => {
    const newValues = { ...attributeValues, [attributeName]: value };
    setAttributeValues(newValues);
    onAttributesChange?.(newValues);
  };

  const renderAttributeInput = (attribute: CategoryAttribute) => {
    const value = attributeValues[attribute.attribute_name] || "";

    switch (attribute.attribute_type) {
      case "text":
        return (
          <Input
            value={value}
            onChange={(e) =>
              handleAttributeChange(attribute.attribute_name, e.target.value)
            }
            placeholder={`Enter ${attribute.attribute_name}`}
            size="sm"
          />
        );

      case "number":
        return (
          <Input
            type="number"
            value={value}
            onChange={(e) =>
              handleAttributeChange(
                attribute.attribute_name,
                Number(e.target.value)
              )
            }
            placeholder={`Enter ${attribute.attribute_name}`}
            size="sm"
          />
        );

      case "select":
        return (
          <Select
            value={value}
            onChange={(e) =>
              handleAttributeChange(attribute.attribute_name, e.target.value)
            }
            placeholder={`Select ${attribute.attribute_name}`}
            size="sm"
          >
            {attribute.options?.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </Select>
        );

      case "boolean":
        return (
          <HStack spacing={2}>
            <Switch
              isChecked={value}
              onChange={(e) =>
                handleAttributeChange(
                  attribute.attribute_name,
                  e.target.checked
                )
              }
              size="sm"
            />
            <Text fontSize="sm">{attribute.attribute_name}</Text>
          </HStack>
        );

      default:
        return (
          <Input
            value={value}
            onChange={(e) =>
              handleAttributeChange(attribute.attribute_name, e.target.value)
            }
            placeholder={`Enter ${attribute.attribute_name}`}
            size="sm"
          />
        );
    }
  };

  if (loading) {
    return (
      <Box textAlign="center" py={8}>
        <Spinner size="lg" />
        <Text mt={2}>Loading categories...</Text>
      </Box>
    );
  }

  return (
    <VStack spacing={4} align="stretch">
      <Card>
        <CardHeader>
          <Heading size="md">Select Category</Heading>
        </CardHeader>
        <CardBody>
          <FormControl>
            <FormLabel>Category</FormLabel>
            <Select
              value={selectedCategory?.toString() || ""}
              onChange={(e) => onCategoryChange(Number(e.target.value))}
              placeholder="Choose a category"
            >
              {categories.map((category) => (
                <option key={category.id} value={category.id.toString()}>
                  {category.name}
                </option>
              ))}
            </Select>
          </FormControl>
        </CardBody>
      </Card>

      {error && (
        <Alert status="error">
          <AlertIcon />
          {error}
        </Alert>
      )}

      {selectedTemplate && (
        <Card>
          <CardHeader>
            <Heading size="md">Product Attributes</Heading>
          </CardHeader>
          <CardBody>
            <VStack spacing={4} align="stretch">
              {selectedTemplate.attributes.map((attribute) => (
                <FormControl key={attribute.id}>
                  <FormLabel>
                    {attribute.attribute_name}
                    {attribute.is_required && (
                      <Badge colorScheme="red" ml={2} fontSize="xs">
                        Required
                      </Badge>
                    )}
                  </FormLabel>
                  {renderAttributeInput(attribute)}
                </FormControl>
              ))}
            </VStack>
          </CardBody>
        </Card>
      )}
    </VStack>
  );
};

// Basic Product Information Component
const BasicProductInfo: React.FC<{
  formData: ProductFormData;
  categories: Category[];
  onInputChange: (field: string, value: any) => void;
}> = ({ formData, categories, onInputChange }) => (
  <Card>
    <CardHeader>
      <Heading size="md">Basic Product Information</Heading>
    </CardHeader>
    <CardBody>
      <VStack spacing={4}>
        <FormControl isRequired>
          <FormLabel>Product Name</FormLabel>
          <Input
            value={formData.name}
            onChange={(e) => onInputChange("name", e.target.value)}
            placeholder="Enter product name"
          />
        </FormControl>

        <FormControl isRequired>
          <FormLabel>Description</FormLabel>
          <Textarea
            value={formData.description}
            onChange={(e) => onInputChange("description", e.target.value)}
            placeholder="Enter product description"
            rows={4}
          />
        </FormControl>

        <HStack spacing={4} w="full">
          <FormControl isRequired>
            <FormLabel>Brand</FormLabel>
            <Input
              value={formData.brand}
              onChange={(e) => onInputChange("brand", e.target.value)}
              placeholder="Enter brand"
            />
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Sell By</FormLabel>
            <Input
              value={formData.sellby}
              onChange={(e) => onInputChange("sellby", e.target.value)}
              placeholder="Enter sell by"
            />
          </FormControl>
        </HStack>

        <HStack spacing={4} w="full">
          <FormControl>
            <FormLabel>Quantity</FormLabel>
            <NumberInput
              value={formData.qty}
              onChange={(value) => onInputChange("qty", parseInt(value) || 1)}
              min={1}
            >
              <NumberInputField />
              <NumberInputStepper>
                <NumberIncrementStepper />
                <NumberDecrementStepper />
              </NumberInputStepper>
            </NumberInput>
          </FormControl>

          <FormControl>
            <FormLabel>Is POD Product</FormLabel>
            <Switch
              isChecked={formData.is_pod}
              onChange={(e) => onInputChange("is_pod", e.target.checked)}
            />
          </FormControl>
        </HStack>
      </VStack>
    </CardBody>
  </Card>
);

// Product Images Component
const ProductImages: React.FC<{
  imagePreview: string[];
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onImageRemove: (index: number) => void;
}> = ({ imagePreview, onImageUpload, onImageRemove }) => (
  <Card>
    <CardHeader>
      <Heading size="md">Product Images</Heading>
    </CardHeader>
    <CardBody>
      <VStack spacing={4}>
        <FormControl>
          <FormLabel>Upload Images</FormLabel>
          <Input
            type="file"
            accept="image/*"
            multiple
            onChange={onImageUpload}
          />
        </FormControl>

        {imagePreview.length > 0 && (
          <SimpleGrid columns={[2, 3, 4]} spacing={4} w="full">
            {imagePreview.map((image, index) => (
              <Box key={index} position="relative">
                <Image
                  src={image}
                  alt={`Product ${index + 1}`}
                  borderRadius="md"
                  objectFit="cover"
                  h="100px"
                  w="full"
                />
                <IconButton
                  aria-label="Remove image"
                  icon={<DeleteIcon />}
                  size="sm"
                  colorScheme="red"
                  position="absolute"
                  top={1}
                  right={1}
                  onClick={() => onImageRemove(index)}
                />
              </Box>
            ))}
          </SimpleGrid>
        )}
      </VStack>
    </CardBody>
  </Card>
);

// Clothing Variation Form Component
const ClothingVariationForm: React.FC<{
  currentVariation: ClothingVariation;
  isPOD: boolean;
  onVariationChange: (field: string, value: any) => void;
  onVariationAdd: () => void;
}> = ({ currentVariation, isPOD, onVariationChange, onVariationAdd }) => (
  <Card>
    <CardHeader>
      <Heading size="md">Add Clothing Variation</Heading>
    </CardHeader>
    <CardBody>
      <VStack spacing={4}>
        <HStack spacing={4} w="full">
          <FormControl isRequired>
            <FormLabel>SKU</FormLabel>
            <Input
              value={currentVariation.sku}
              onChange={(e) => onVariationChange("sku", e.target.value)}
              placeholder="Enter SKU"
            />
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Size</FormLabel>
            <Select
              value={currentVariation.size}
              onChange={(e) => onVariationChange("size", e.target.value)}
              placeholder="Select size"
            >
              {SIZE_OPTIONS.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </Select>
          </FormControl>
        </HStack>

        <HStack spacing={4} w="full">
          <FormControl isRequired>
            <FormLabel>Color</FormLabel>
            <Select
              value={currentVariation.color}
              onChange={(e) => onVariationChange("color", e.target.value)}
              placeholder="Select color"
            >
              {COLOR_OPTIONS.map((color) => (
                <option key={color} value={color}>
                  {color}
                </option>
              ))}
            </Select>
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Selling Price</FormLabel>
            <NumberInput
              value={currentVariation.selling_price}
              onChange={(value) =>
                onVariationChange("selling_price", Number(value) || 0)
              }
              min={0}
            >
              <NumberInputField />
              <NumberInputStepper>
                <NumberIncrementStepper />
                <NumberDecrementStepper />
              </NumberInputStepper>
            </NumberInput>
          </FormControl>
        </HStack>

        {isPOD && (
          <Accordion allowToggle>
            <AccordionItem>
              <AccordionButton>
                <Box as="span" flex="1" textAlign="left">
                  POD Details (Optional)
                </Box>
                <AccordionIcon />
              </AccordionButton>
              <AccordionPanel>
                <VStack spacing={4}>
                  <HStack spacing={4} w="full">
                    <FormControl>
                      <FormLabel>Qikink SKU</FormLabel>
                      <Input
                        value={currentVariation.qikink_sku || ""}
                        onChange={(e) =>
                          onVariationChange("qikink_sku", e.target.value)
                        }
                        placeholder="Enter Qikink SKU"
                      />
                    </FormControl>

                    <FormControl>
                      <FormLabel>Qikink Price</FormLabel>
                      <NumberInput
                        value={currentVariation.qikink_price || 0}
                        onChange={(value) =>
                          onVariationChange("qikink_price", Number(value) || 0)
                        }
                        min={0}
                      >
                        <NumberInputField />
                        <NumberInputStepper>
                          <NumberIncrementStepper />
                          <NumberDecrementStepper />
                        </NumberInputStepper>
                      </NumberInput>
                    </FormControl>
                  </HStack>

                  <HStack spacing={4} w="full">
                    <FormControl>
                      <FormLabel>Print Type ID</FormLabel>
                      <Input
                        value={currentVariation.print_type_id || ""}
                        onChange={(e) =>
                          onVariationChange("print_type_id", e.target.value)
                        }
                        placeholder="Enter print type ID"
                      />
                    </FormControl>

                    <FormControl>
                      <FormLabel>Design Code</FormLabel>
                      <Input
                        value={currentVariation.design_code || ""}
                        onChange={(e) =>
                          onVariationChange("design_code", e.target.value)
                        }
                        placeholder="Enter design code"
                      />
                    </FormControl>
                  </HStack>

                  <HStack spacing={4} w="full">
                    <FormControl>
                      <FormLabel>Design Link</FormLabel>
                      <Input
                        value={currentVariation.design_link || ""}
                        onChange={(e) =>
                          onVariationChange("design_link", e.target.value)
                        }
                        placeholder="Enter design link"
                      />
                    </FormControl>

                    <FormControl>
                      <FormLabel>Mockup Link</FormLabel>
                      <Input
                        value={currentVariation.mockup_link || ""}
                        onChange={(e) =>
                          onVariationChange("mockup_link", e.target.value)
                        }
                        placeholder="Enter mockup link"
                      />
                    </FormControl>
                  </HStack>

                  <FormControl>
                    <FormLabel>Placement SKU</FormLabel>
                    <Input
                      value={currentVariation.placement_sku || ""}
                      onChange={(e) =>
                        onVariationChange("placement_sku", e.target.value)
                      }
                      placeholder="Enter placement SKU"
                    />
                  </FormControl>
                </VStack>
              </AccordionPanel>
            </AccordionItem>
          </Accordion>
        )}

        <FormControl>
          <FormLabel>Available</FormLabel>
          <Switch
            isChecked={currentVariation.is_available}
            onChange={(e) =>
              onVariationChange("is_available", e.target.checked)
            }
          />
        </FormControl>

        <Button
          leftIcon={<AddIcon />}
          colorScheme="blue"
          onClick={onVariationAdd}
          w="full"
        >
          Add Variation
        </Button>
      </VStack>
    </CardBody>
  </Card>
);

// Multi-Category Variation Form Component
const MultiCategoryVariationForm: React.FC<{
  currentVariation: MultiCategoryVariation;
  onVariationChange: (field: string, value: any) => void;
  onVariationAdd: () => void;
  currentAttributes: Record<string, any>;
}> = ({
  currentVariation,
  onVariationChange,
  onVariationAdd,
  currentAttributes,
}) => (
  <Card>
    <CardHeader>
      <Heading size="md">Add Multi-Category Variation</Heading>
    </CardHeader>
    <CardBody>
      <VStack spacing={4}>
        <HStack spacing={4} w="full">
          <FormControl isRequired>
            <FormLabel>SKU</FormLabel>
            <Input
              value={currentVariation.sku}
              onChange={(e) => onVariationChange("sku", e.target.value)}
              placeholder="Enter SKU"
            />
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Variation Name</FormLabel>
            <Input
              value={currentVariation.variation_name}
              onChange={(e) =>
                onVariationChange("variation_name", e.target.value)
              }
              placeholder="Enter variation name"
            />
          </FormControl>
        </HStack>

        <HStack spacing={4} w="full">
          <FormControl isRequired>
            <FormLabel>Selling Price</FormLabel>
            <NumberInput
              value={currentVariation.selling_price}
              onChange={(value) =>
                onVariationChange("selling_price", Number(value) || 0)
              }
              min={0}
            >
              <NumberInputField />
              <NumberInputStepper>
                <NumberIncrementStepper />
                <NumberDecrementStepper />
              </NumberInputStepper>
            </NumberInput>
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Stock Quantity</FormLabel>
            <NumberInput
              value={currentVariation.stock_quantity}
              onChange={(value) =>
                onVariationChange("stock_quantity", Number(value) || 0)
              }
              min={0}
            >
              <NumberInputField />
              <NumberInputStepper>
                <NumberIncrementStepper />
                <NumberDecrementStepper />
              </NumberInputStepper>
            </NumberInput>
          </FormControl>
        </HStack>

        <FormControl>
          <FormLabel>Available</FormLabel>
          <Switch
            isChecked={currentVariation.is_available}
            onChange={(e) =>
              onVariationChange("is_available", e.target.checked)
            }
          />
        </FormControl>

        {Object.keys(currentAttributes).length > 0 && (
          <Box w="full">
            <Text fontWeight="bold" mb={2}>
              Category Attributes:
            </Text>
            <VStack spacing={2} align="stretch">
              {Object.entries(currentAttributes).map(([key, value]) => (
                <HStack key={key} justify="space-between">
                  <Text fontSize="sm">{key}:</Text>
                  <Badge colorScheme="blue">{String(value)}</Badge>
                </HStack>
              ))}
            </VStack>
          </Box>
        )}

        <Button
          leftIcon={<AddIcon />}
          colorScheme="blue"
          onClick={onVariationAdd}
          w="full"
        >
          Add Variation
        </Button>
      </VStack>
    </CardBody>
  </Card>
);

// Added Variations Component
const AddedVariations: React.FC<{
  variations: any[];
  isPOD: boolean;
  onVariationRemove: (index: number) => void;
  isMultiCategory?: boolean;
}> = ({ variations, isPOD, onVariationRemove, isMultiCategory = false }) => (
  <Card>
    <CardHeader>
      <Heading size="md">Added Variations ({variations.length})</Heading>
    </CardHeader>
    <CardBody>
      <VStack spacing={4}>
        {variations.map((variation, index) => (
          <Card key={index} variant="outline">
            <CardBody>
              <VStack spacing={3} align="stretch">
                <HStack justify="space-between">
                  <Text fontWeight="bold">
                    {isMultiCategory
                      ? variation.variation_name
                      : `${variation.size} - ${variation.color}`}
                  </Text>
                  <IconButton
                    aria-label="Remove variation"
                    icon={<DeleteIcon />}
                    size="sm"
                    colorScheme="red"
                    onClick={() => onVariationRemove(index)}
                  />
                </HStack>

                <HStack justify="space-between">
                  <Text fontSize="sm">SKU: {variation.sku}</Text>
                  <Text fontSize="sm">Price: ₹{variation.selling_price}</Text>
                </HStack>

                {isMultiCategory ? (
                  <HStack justify="space-between">
                    <Text fontSize="sm">Stock: {variation.stock_quantity}</Text>
                    <Badge
                      colorScheme={variation.is_available ? "green" : "red"}
                    >
                      {variation.is_available ? "Available" : "Unavailable"}
                    </Badge>
                  </HStack>
                ) : (
                  <HStack justify="space-between">
                    <Text fontSize="sm">Size: {variation.size}</Text>
                    <Text fontSize="sm">Color: {variation.color}</Text>
                  </HStack>
                )}

                {isMultiCategory &&
                  Object.keys(variation.attributes).length > 0 && (
                    <Box>
                      <Text fontSize="sm" fontWeight="bold" mb={1}>
                        Attributes:
                      </Text>
                      <SimpleGrid columns={2} spacing={2}>
                        {Object.entries(variation.attributes).map(
                          ([key, value]) => (
                            <HStack key={key} justify="space-between">
                              <Text fontSize="xs">{key}:</Text>
                              <Badge size="sm" colorScheme="blue">
                                {String(value)}
                              </Badge>
                            </HStack>
                          )
                        )}
                      </SimpleGrid>
                    </Box>
                  )}

                {isPOD && !isMultiCategory && (
                  <Box>
                    <Text fontSize="sm" fontWeight="bold" mb={1}>
                      POD Details:
                    </Text>
                    <SimpleGrid columns={2} spacing={2}>
                      {variation.qikink_sku && (
                        <HStack justify="space-between">
                          <Text fontSize="xs">Qikink SKU:</Text>
                          <Badge size="sm" colorScheme="purple">
                            {variation.qikink_sku}
                          </Badge>
                        </HStack>
                      )}
                      {variation.qikink_price && (
                        <HStack justify="space-between">
                          <Text fontSize="xs">Qikink Price:</Text>
                          <Badge size="sm" colorScheme="purple">
                            ₹{variation.qikink_price}
                          </Badge>
                        </HStack>
                      )}
                    </SimpleGrid>
                  </Box>
                )}
              </VStack>
            </CardBody>
          </Card>
        ))}

        {variations.length === 0 && (
          <Text textAlign="center" color="gray.500">
            No variations added yet
          </Text>
        )}
      </VStack>
    </CardBody>
  </Card>
);

// Main Component
const ProductRegistrationForm: React.FC<AddProductProps> = ({ categories }) => {
  const { currentUser } = useContext(LoginContext);
  const toast = useToast();
  const [formData, setFormData] = useState<ProductFormData>(INITIAL_FORM_DATA);
  const [currentClothingVariation, setCurrentClothingVariation] =
    useState<ClothingVariation>(INITIAL_CLOTHING_VARIATION);
  const [currentMultiCategoryVariation, setCurrentMultiCategoryVariation] =
    useState<MultiCategoryVariation>(INITIAL_MULTI_CATEGORY_VARIATION);
  const [currentAttributes, setCurrentAttributes] = useState<
    Record<string, any>
  >({});
  const [imagePreview, setImagePreview] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(0); // 0 for clothing, 1 for multi-category

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleClothingVariationChange = (field: string, value: any) => {
    setCurrentClothingVariation((prev) => ({ ...prev, [field]: value }));
  };

  const handleMultiCategoryVariationChange = (field: string, value: any) => {
    setCurrentMultiCategoryVariation((prev) => ({ ...prev, [field]: value }));
  };

  const handleCategoryChange = (categoryId: number) => {
    handleInputChange("category_id", categoryId.toString());
    setFormData((prev) => ({ ...prev, variations: [] })); // Clear variations when category changes
  };

  const handleAttributesChange = (attributes: Record<string, any>) => {
    setCurrentAttributes(attributes);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newImages: string[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const base64 = await convertFileToBase64(file);
      newImages.push(base64);
    }

    setImagePreview((prev) => [...prev, ...newImages]);
    setFormData((prev) => ({
      ...prev,
      productImages: [...prev.productImages, ...newImages],
    }));
  };

  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleImageRemove = (index: number) => {
    setImagePreview((prev) => prev.filter((_, i) => i !== index));
    setFormData((prev) => ({
      ...prev,
      productImages: prev.productImages.filter((_, i) => i !== index),
    }));
  };

  const handleClothingVariationAdd = () => {
    if (
      !currentClothingVariation.sku ||
      !currentClothingVariation.size ||
      !currentClothingVariation.color
    ) {
      toast({
        title: "Error",
        description: "Please fill in SKU, size, and color",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setFormData((prev) => ({
      ...prev,
      variations: [
        ...(prev.variations as ClothingVariation[]),
        currentClothingVariation,
      ],
    }));

    setCurrentClothingVariation(INITIAL_CLOTHING_VARIATION);
  };

  const handleMultiCategoryVariationAdd = () => {
    if (
      !currentMultiCategoryVariation.sku ||
      !currentMultiCategoryVariation.variation_name
    ) {
      toast({
        title: "Error",
        description: "Please fill in SKU and variation name",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const newVariation: MultiCategoryVariation = {
      ...currentMultiCategoryVariation,
      attributes: { ...currentAttributes },
    };

    setFormData((prev) => ({
      ...prev,
      variations: [
        ...(prev.variations as MultiCategoryVariation[]),
        newVariation,
      ],
    }));

    setCurrentMultiCategoryVariation(INITIAL_MULTI_CATEGORY_VARIATION);
    setCurrentAttributes({});
  };

  const handleVariationRemove = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      variations: prev.variations.filter((_, i) => i !== index),
    }));
  };

  const resetForm = () => {
    setFormData(INITIAL_FORM_DATA);
    setCurrentClothingVariation(INITIAL_CLOTHING_VARIATION);
    setCurrentMultiCategoryVariation(INITIAL_MULTI_CATEGORY_VARIATION);
    setCurrentAttributes({});
    setImagePreview([]);
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.description || !formData.category_id) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (formData.variations.length === 0) {
      toast({
        title: "Error",
        description: "Please add at least one variation",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      setLoading(true);
      const response = await authInstance.post("/register-product", formData);

      if (response.data.status === 201) {
        toast({
          title: "Success",
          description: "Product added successfully",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        resetForm();
      }
    } catch (error: any) {
      console.error("Error adding product:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to add product",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box p={6}>
      <VStack spacing={6} align="stretch">
        <Heading size="lg" textAlign="center">
          Add New Product
        </Heading>

        <Tabs index={activeTab} onChange={setActiveTab}>
          <TabList>
            <Tab>Clothing Products</Tab>
            <Tab>Multi-Category Products</Tab>
          </TabList>

          <TabPanels>
            {/* Clothing Products Tab */}
            <TabPanel>
              <Grid templateColumns={{ base: "1fr", lg: "1fr 1fr" }} gap={6}>
                {/* Left Column - Basic Info and Images */}
                <VStack spacing={6}>
                  <BasicProductInfo
                    formData={formData}
                    categories={categories}
                    onInputChange={handleInputChange}
                  />

                  <ProductImages
                    imagePreview={imagePreview}
                    onImageUpload={handleImageUpload}
                    onImageRemove={handleImageRemove}
                  />
                </VStack>

                {/* Right Column - Variations */}
                <VStack spacing={6}>
                  <ClothingVariationForm
                    currentVariation={currentClothingVariation}
                    isPOD={formData.is_pod}
                    onVariationChange={handleClothingVariationChange}
                    onVariationAdd={handleClothingVariationAdd}
                  />

                  <AddedVariations
                    variations={formData.variations as ClothingVariation[]}
                    isPOD={formData.is_pod}
                    onVariationRemove={handleVariationRemove}
                    isMultiCategory={false}
                  />
                </VStack>
              </Grid>
            </TabPanel>

            {/* Multi-Category Products Tab */}
            <TabPanel>
              <Grid templateColumns={{ base: "1fr", lg: "1fr 1fr" }} gap={6}>
                {/* Left Column - Category and Basic Info */}
                <VStack spacing={6}>
                  <CategorySelector
                    selectedCategory={formData.selectedCategory}
                    onCategoryChange={handleCategoryChange}
                    onAttributesChange={handleAttributesChange}
                  />

                  <BasicProductInfo
                    formData={formData}
                    categories={categories}
                    onInputChange={handleInputChange}
                  />

                  <ProductImages
                    imagePreview={imagePreview}
                    onImageUpload={handleImageUpload}
                    onImageRemove={handleImageRemove}
                  />
                </VStack>

                {/* Right Column - Variations */}
                <VStack spacing={6}>
                  <MultiCategoryVariationForm
                    currentVariation={currentMultiCategoryVariation}
                    onVariationChange={handleMultiCategoryVariationChange}
                    onVariationAdd={handleMultiCategoryVariationAdd}
                    currentAttributes={currentAttributes}
                  />

                  <AddedVariations
                    variations={formData.variations as MultiCategoryVariation[]}
                    isPOD={formData.is_pod}
                    onVariationRemove={handleVariationRemove}
                    isMultiCategory={true}
                  />
                </VStack>
              </Grid>
            </TabPanel>
          </TabPanels>
        </Tabs>

        <HStack spacing={4} justify="center">
          <Button
            colorScheme="blue"
            size="lg"
            onClick={handleSubmit}
            isLoading={loading}
            loadingText="Adding Product"
          >
            Add Product
          </Button>
          <Button colorScheme="gray" size="lg" onClick={resetForm}>
            Reset Form
          </Button>
        </HStack>
      </VStack>
    </Box>
  );
};

export default ProductRegistrationForm;
