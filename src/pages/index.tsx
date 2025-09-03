import type { NextPageWithLayout } from './_app';
import { FileUploadSection } from '../components/FileUploadSection';

const IndexPage: NextPageWithLayout = () => {
  return (
    <div className="flex flex-col bg-gray-100 min-h-screen py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold text-center text-gray-900 mb-8">
          SearchBox App
        </h1>
        <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
          Upload and search through your documents with ease. Select multiple
          files and get started with your document management.
        </p>

        {/* File Upload Section */}
        <FileUploadSection />
      </div>
    </div>
  );
};

export default IndexPage;
