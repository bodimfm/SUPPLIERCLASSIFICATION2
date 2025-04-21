import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="container mx-auto py-16 px-4 flex flex-col items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <h1 className="text-9xl font-bold text-gray-200">404</h1>
        <h2 className="text-3xl font-semibold mt-4 mb-6">Página não encontrada</h2>
        <p className="text-gray-600 mb-8">
          Desculpe, não conseguimos encontrar a página que você está procurando.
        </p>
        <Button asChild>
          <Link href="/">
            Voltar para a página inicial
          </Link>
        </Button>
      </div>
    </div>
  );
}