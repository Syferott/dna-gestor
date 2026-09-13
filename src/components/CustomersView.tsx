import React, { useState } from 'react';
import {
  UserPlus,
  Search,
  Mail,
  Phone,
  MapPin,
  FileText,
  Edit2,
  Trash2,
  FilePlus,
  Building,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Customer } from '../types';
import { CustomerModal } from './CustomerModal';
import { formatDocument, formatPhone, formatDate } from '../utils/formatters';

interface CustomersViewProps {
  onNewQuoteForCustomer?: (customer: Customer) => void;
}

export const CustomersView: React.FC<CustomersViewProps> = ({ onNewQuoteForCustomer }) => {
  const { customers, addCustomer, updateCustomer, deleteCustomer, quotes } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  const filteredCustomers = customers.filter(c => {
    const q = searchTerm.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      (c.document && c.document.includes(q)) ||
      (c.email && c.email.toLowerCase().includes(q)) ||
      (c.address?.city && c.address.city.toLowerCase().includes(q)) ||
      (c.phone && c.phone.includes(q))
    );
  });

  const handleEdit = (customer: Customer) => {
    setEditingCustomer(customer);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string, name: string) => {
    const hasQuotes = quotes.some(q => q.customerId === id);
    let confirmMsg = `Deseja realmente remover o cliente "${name}"?`;
    if (hasQuotes) {
      confirmMsg += `\nAtenção: Este cliente possui orçamentos associados.`;
    }
    if (window.confirm(confirmMsg)) {
      deleteCustomer(id);
    }
  };

  const handleSaveCustomer = (data: Omit<Customer, 'id' | 'createdAt'>) => {
    if (editingCustomer) {
      updateCustomer(editingCustomer.id, data);
    } else {
      addCustomer(data);
    }
    setEditingCustomer(null);
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl shadow-xs border border-slate-200">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            Cadastro de Clientes
            <span className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full font-medium">
              {customers.length} {customers.length === 1 ? 'cliente' : 'clientes'}
            </span>
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Gerencie contatos, endereços e dados cadastrais dos seus clientes e empresas.
          </p>
        </div>

        <button
          onClick={() => {
            setEditingCustomer(null);
            setIsModalOpen(true);
          }}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium text-sm shadow-sm hover:shadow transition-all cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          <span>Cadastrar Novo Cliente</span>
        </button>
      </div>

      {/* Search Filter */}
      <div className="relative">
        <input
          type="text"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          placeholder="Buscar cliente por nome, CPF/CNPJ, e-mail, telefone ou cidade..."
          className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm shadow-xs focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
        />
        <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5" />
      </div>

      {/* Customer List */}
      {filteredCustomers.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-300 p-8">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
            <Building className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-slate-800">
            {searchTerm ? 'Nenhum cliente encontrado' : 'Nenhum cliente cadastrado ainda'}
          </h3>
          <p className="text-sm text-slate-500 max-w-sm mx-auto mt-1 mb-4">
            {searchTerm
              ? 'Tente ajustar os termos da busca.'
              : 'Cadastre seus primeiros clientes para gerar orçamentos e gerenciar seu negócio.'}
          </p>
          {!searchTerm && (
            <button
              onClick={() => {
                setEditingCustomer(null);
                setIsModalOpen(true);
              }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg"
            >
              <UserPlus className="w-4 h-4" />
              Cadastrar Agora
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredCustomers.map(customer => {
            const customerQuotes = quotes.filter(q => q.customerId === customer.id);
            const totalSpent = customerQuotes
              .filter(q => q.status === 'convertido' || q.status === 'aprovado')
              .reduce((acc, q) => acc + q.total, 0);

            return (
              <div
                key={customer.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between overflow-hidden"
              >
                <div className="p-5 space-y-3.5">
                  {/* Title & Document */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <h3 className="font-bold text-slate-900 text-base leading-snug">
                        {customer.name}
                      </h3>
                      {customer.document && (
                        <p className="text-xs font-mono text-slate-500 mt-0.5">
                          {formatDocument(customer.document)}
                        </p>
                      )}
                    </div>
                    <span className="text-[11px] font-semibold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md shrink-0">
                      {customerQuotes.length} {customerQuotes.length === 1 ? 'orçamento' : 'orçamentos'}
                    </span>
                  </div>

                  {/* Contact Details */}
                  <div className="space-y-1.5 text-xs text-slate-600 pt-1">
                    {customer.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>{formatPhone(customer.phone)}</span>
                      </div>
                    )}

                    {customer.email && (
                      <div className="flex items-center gap-2 truncate">
                        <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{customer.email}</span>
                      </div>
                    )}

                    {customer.address?.city && (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>
                          {customer.address.city}
                          {customer.address.state ? ` - ${customer.address.state}` : ''}
                          {customer.address.street ? `, ${customer.address.street}` : ''}
                        </span>
                      </div>
                    )}

                    {customer.notes && (
                      <div className="flex items-start gap-2 pt-1 text-slate-500 italic">
                        <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                        <span className="line-clamp-2">{customer.notes}</span>
                      </div>
                    )}
                  </div>

                  {/* Purchases stats */}
                  {totalSpent > 0 && (
                    <div className="bg-emerald-50 border border-emerald-100 rounded-lg px-3 py-1.5 text-xs text-emerald-800 flex justify-between items-center">
                      <span className="font-medium">Total em Compras:</span>
                      <span className="font-bold">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalSpent)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Footer Actions */}
                <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">
                    Cadastrado em {formatDate(customer.createdAt)}
                  </span>
                  <div className="flex items-center gap-1">
                    {onNewQuoteForCustomer && (
                      <button
                        onClick={() => onNewQuoteForCustomer(customer)}
                        title="Criar Orçamento para este Cliente"
                        className="p-1.5 text-emerald-600 hover:bg-emerald-100 rounded-lg transition-colors"
                      >
                        <FilePlus className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => handleEdit(customer)}
                      title="Editar Dados"
                      className="p-1.5 text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(customer.id, customer.name)}
                      title="Excluir Cliente"
                      className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Customer Add/Edit Modal */}
      <CustomerModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingCustomer(null);
        }}
        onSave={handleSaveCustomer}
        customerToEdit={editingCustomer}
      />
    </div>
  );
};
