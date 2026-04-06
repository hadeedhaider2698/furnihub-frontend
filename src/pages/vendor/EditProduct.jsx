import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { Helmet } from 'react-helmet-async';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Package, DollarSign, Layers, Save, ChevronLeft, Plus, X, Loader2, AlertCircle } from 'lucide-react';
import api from '../../services/api.js';
import FileUpload from '../../components/ui/FileUpload.jsx';
import { FullPageLoader } from '../../components/ui/Loader.jsx';

const CATEGORIES = [
  'sofa', 'bed', 'dining-table', 'chair', 'wardrobe',
  'desk', 'bookshelf', 'cabinet', 'outdoor', 'decor', 'other'
];

const productSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  category: z.enum(CATEGORIES, { errorMap: () => ({ message: 'Please select a category' }) }),
  price: z.coerce.number().min(1, 'Price must be greater than 0'),
  discountPrice: z.coerce.number().optional().nullable(),
  stock: z.coerce.number().min(0, 'Stock cannot be negative'),
  material: z.string().optional(),
});

export default function EditProduct() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [images, setImages] = useState([]);
  const [colorInput, setColorInput] = useState('');
  const [colors, setColors] = useState([]);

  const { data: product, isLoading, isError } = useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      // We need a specific endpoint to fetch a single product for editing
      // Usually productDetail works but we need to ensure the vendor owns it
      const res = await api.get(`/products/id/${id}`);
      return res.data.data.product;
    },
    enabled: !!id
  });

  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: zodResolver(productSchema),
  });

  useEffect(() => {
    if (product) {
      reset({
        title: product.title,
        description: product.description,
        category: product.category,
        price: product.price,
        discountPrice: product.discountPrice,
        stock: product.stock,
        material: product.material,
      });
      setImages(product.images || []);
      setColors(product.colors || []);
    }
  }, [product, reset]);

  const updateMutation = useMutation({
    mutationFn: (payload) => api.put(`/products/${id}`, payload),
    onSuccess: () => {
      toast.success('🎉 Product updated successfully!');
      queryClient.invalidateQueries(['vendorProducts']);
      queryClient.invalidateQueries(['product', id]);
      navigate('/vendor/products');
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to update product');
    }
  });

  const addColor = () => {
    const val = colorInput.trim();
    if (val && !colors.find(c => c.name.toLowerCase() === val.toLowerCase())) {
      setColors([...colors, { name: val, hex: '#888888' }]);
      setColorInput('');
    }
  };

  const removeColor = (idx) => setColors(colors.filter((_, i) => i !== idx));

  const onSubmit = (data) => {
    if (images.length === 0) {
      toast.error('Please upload at least one product image');
      return;
    }

    const payload = {
      ...data,
      discountPrice: data.discountPrice || undefined,
      images: images.map((img, idx) => ({
        url: img.url,
        publicId: img.publicId,
        isPrimary: idx === 0,
      })),
      colors,
    };

    updateMutation.mutate(payload);
  };

  if (isLoading) return <FullPageLoader />;

  if (isError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-10 text-center">
        <AlertCircle size={48} className="text-red-500 mb-4" />
        <h2 className="text-xl font-bold">Product not found</h2>
        <button onClick={() => navigate(-1)} className="mt-4 text-blue-600 font-bold hover:underline">Go Back</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--surface)] pb-24">
      <Helmet><title>Edit Product | FurniHub Vendor</title></Helmet>

      {/* Header */}
      <div className="sticky top-0 z-10 bg-[var(--surface)]/90 backdrop-blur-md border-b border-[var(--border)] px-4 py-3 flex items-center justify-between">
        <button onClick={() => navigate(-1)} className="p-1.5 hover:bg-[var(--surface-2)] rounded-full transition-colors">
          <ChevronLeft size={22} />
        </button>
        <h1 className="font-bold text-[var(--primary)] uppercase tracking-tight">Edit Product</h1>
        <button
          onClick={handleSubmit(onSubmit)}
          disabled={updateMutation.isPending}
          className="flex items-center gap-2 bg-[var(--primary)] text-white px-5 py-2 rounded-xl font-bold text-sm disabled:opacity-50 hover:opacity-90 transition-opacity"
        >
          {updateMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          Save Changes
        </button>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        {/* Images */}
        <section className="bg-[var(--surface-2)] p-6 rounded-3xl border border-[var(--border)] shadow-sm">
           <FileUpload 
              label="Product Images"
              multiple 
              maxFiles={8}
              value={images}
              onChange={(val) => setImages(val)}
              folder="furnihub/products"
           />
           <p className="text-[10px] text-[var(--text-secondary)] mt-2 pl-1 font-medium">First image will be the primary cover image. Max 8 images.</p>
        </section>

        {/* Basic Info */}
        <section className="bg-[var(--surface-2)] p-6 rounded-3xl border border-[var(--border)] shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-[var(--primary)] mb-2">
            <Package size={18} />
            <h3 className="text-sm font-black uppercase tracking-widest">General Information</h3>
          </div>
          
          <div>
            <label className="block text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest pl-1 mb-1">Product Title</label>
            <input 
              {...register('title')}
              className="w-full bg-[var(--surface)] border-none rounded-xl py-3 px-4 text-sm font-medium outline-none focus:ring-2 focus:ring-[var(--primary)]/10 transition-all"
              placeholder="e.g. Minimalist Velvet Sofa"
            />
            {errors.title && <p className="text-red-500 text-[10px] mt-1 pl-1 font-bold">{errors.title.message}</p>}
          </div>

          <div>
            <label className="block text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest pl-1 mb-1">Description</label>
            <textarea 
              {...register('description')}
              rows={4}
              className="w-full bg-[var(--surface)] border-none rounded-xl py-3 px-4 text-sm font-medium outline-none focus:ring-2 focus:ring-[var(--primary)]/10 transition-all"
              placeholder="Tell customers about your product..."
            />
            {errors.description && <p className="text-red-500 text-[10px] mt-1 pl-1 font-bold">{errors.description.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest pl-1 mb-1">Category</label>
              <select 
                {...register('category')}
                className="w-full bg-[var(--surface)] border-none rounded-xl py-3 px-4 text-sm font-bold outline-none cursor-pointer capitalize"
              >
                <option value="">Select Category</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c.replace('-', ' ')}</option>)}
              </select>
              {errors.category && <p className="text-red-500 text-[10px] mt-1 pl-1 font-bold">{errors.category.message}</p>}
            </div>
            <div>
              <label className="block text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest pl-1 mb-1">Stock Quantity</label>
              <input 
                type="number"
                {...register('stock')}
                className="w-full bg-[var(--surface)] border-none rounded-xl py-3 px-4 text-sm font-medium outline-none"
              />
              {errors.stock && <p className="text-red-500 text-[10px] mt-1 pl-1 font-bold">{errors.stock.message}</p>}
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section className="bg-[var(--surface-2)] p-6 rounded-3xl border border-[var(--border)] shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-[var(--primary)] mb-2">
            <DollarSign size={18} />
            <h3 className="text-sm font-black uppercase tracking-widest">Pricing Strategy</h3>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest pl-1 mb-1">Regular Price</label>
              <input 
                type="number"
                {...register('price')}
                className="w-full bg-[var(--surface)] border-none rounded-xl py-3 px-4 text-sm font-medium outline-none"
                placeholder="0.00"
              />
              {errors.price && <p className="text-red-500 text-[10px] mt-1 pl-1 font-bold">{errors.price.message}</p>}
            </div>
            <div>
              <label className="block text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest pl-1 mb-1">Discount Price (Optional)</label>
              <input 
                type="number"
                {...register('discountPrice')}
                className="w-full bg-[var(--surface)] border-none rounded-xl py-3 px-4 text-sm font-medium outline-none"
                placeholder="0.00"
              />
            </div>
          </div>
        </section>

        {/* Variations */}
        <section className="bg-[var(--surface-2)] p-6 rounded-3xl border border-[var(--border)] shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-[var(--primary)] mb-2">
            <Layers size={18} />
            <h3 className="text-sm font-black uppercase tracking-widest">Product Attributes</h3>
          </div>

          <div>
             <label className="block text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest pl-1 mb-1">Material</label>
             <input 
                {...register('material')}
                className="w-full bg-[var(--surface)] border-none rounded-xl py-3 px-4 text-sm font-medium outline-none"
                placeholder="e.g. Teak Wood, Canvas"
             />
          </div>

          <div>
            <label className="block text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest pl-1 mb-1">Available Colors</label>
            <div className="flex gap-2 mb-3">
              <input 
                value={colorInput}
                onChange={(e) => setColorInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addColor())}
                className="flex-1 bg-[var(--surface)] border-none rounded-xl py-3 px-4 text-sm outline-none"
                placeholder="Type color and press enter"
              />
              <button 
                type="button"
                onClick={addColor}
                className="p-3 bg-[var(--surface)] hover:bg-[var(--border)] rounded-xl transition-colors"
              >
                <Plus size={20} />
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
               {colors.map((c, i) => (
                 <span key={i} className="flex items-center gap-1 bg-white border border-[var(--border)] px-3 py-1.5 rounded-full text-xs font-bold text-[var(--primary)]">
                    {c.name}
                    <button onClick={() => removeColor(i)}><X size={14} className="text-red-500" /></button>
                 </span>
               ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
