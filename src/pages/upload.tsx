import type { NextPageWithLayout } from './_app';
import { FileUploadSection } from '../components/FileUploadSection';
import { Navigation } from '../components/Navigation';

const UploadPage: NextPageWithLayout = () => {
  return (
    <div className="flex flex-col bg-gray-100 min-h-screen">
      <Navigation currentPage="upload" />
      <div className="flex-1 py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold text-center text-gray-900 mb-8">Upload Documents</h1>
          <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
            Upload your documents to make them searchable. Select multiple files and get started
            with your document management.
          </p>

          {/* File Upload Section */}
          <FileUploadSection />
        </div>
      </div>
    </div>
  );
};

export default UploadPage;
