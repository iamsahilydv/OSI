import React, { useState, useEffect } from "react";
import {
  Box,
  VStack,
  HStack,
  Text,
  Select,
  Input,
  FormControl,
  FormLabel,
  Switch,
  Badge,
  Card,
  CardBody,
  CardHeader,
  Heading,
  Spinner,
  Alert,
  AlertIcon,
} from "@chakra-ui/react";
import { authInstance } from "../../Axios/Axios";

interface CategoryAttribute {
  id: number;
  attribute_name: string;
  attribute_type: "text" | "number" | "select" | "boolean" | "color" | "size";
  is_required: boolean;
  options?: string[];
  display_order: number;
}

interface Category {
  id: number;
  name: string;
  description: string;
}

interface CategoryTemplate {
  category_id: number;
  attributes: CategoryAttribute[];
}

interface CategorySelectorProps {
  selectedCategory?: number;
  onCategoryChange: (categoryId: number) => void;
  onAttributesChange?: (attributes: Record<string, any>) => void;
}

const CategorySelector: React.FC<CategorySelectorProps> = ({
  selectedCategory,
  onCategoryChange,
  onAttributesChange,
}) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<CategoryTemplate | null>(null);
  const [attributeValues, setAttributeValues] = useState<Record<string, any>>({});
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
      const response = await authInstance.get(`/category-template/${categoryId}`);
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
            onChange={(e) => handleAttributeChange(attribute.attribute_name, e.target.value)}
            placeholder={`Enter ${attribute.attribute_name}`}
            size="sm"
          />
        );

      case "number":
        return (
          <Input
            type="number"
            value={value}
            onChange={(e) => handleAttributeChange(attribute.attribute_name, Number(e.target.value))}
            placeholder={`Enter ${attribute.attribute_name}`}
            size="sm"
          />
        );

      case "select":
        return (
          <Select
            value={value}
            onChange={(e) => handleAttributeChange(attribute.attribute_name, e.target.value)}
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
              onChange={(e) => handleAttributeChange(attribute.attribute_name, e.target.checked)}
              size="sm"
            />
            <Text fontSize="sm">{attribute.attribute_name}</Text>
          </HStack>
        );

      default:
        return (
          <Input
            value={value}
            onChange={(e) => handleAttributeChange(attribute.attribute_name, e.target.value)}
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

export default CategorySelector; 