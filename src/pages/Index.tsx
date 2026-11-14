import React, { useState, useEffect } from 'react';
import { StorageService } from '../lib/storage';
import { User, ShopSettings } from '../types';
import { Sidebar, ActiveTab } from '../components/layout/Sidebar';
import { Header } from '../components/layout/Header';
import { UserSwitchModal } from '../components/layout/UserSwitchModal';
import { POSBilling } from '../components/pos/POSBilling';
import { ShopDashboard } from '../components/dashboard/ShopDashboard';
import { ProductManager } from '../components/products/ProductManager';
import { InventoryManager } from '../components/inventory/InventoryManager';
import { PurchaseManager } from '../components/purchases/PurchaseManager';
import { SupplierManager } from '../components/suppliers/SupplierManager';
import { CustomerManager } from '../components/customers/CustomerManager';
import { SalesHistory } from '../components/sales/SalesHistory';
import { ReturnManager } from '../components/returns/ReturnManager';
import { ExpenseManager } from '../components/expenses/ExpenseManager';
import { ReportsManager } from '../components/reports/ReportsManager';
import { SettingsManager } from '../components/settings/SettingsManager';

// Mobile-First Components
import { MobileHeader } from '../components/layout/MobileHeader';
import { MobileBottomNav, MobileTab } from '../components/layout/MobileBottomNav';
import { MobileBilling } from '../components/pos/MobileBilling';
import { MobileStockManager } from '../components/stock/MobileStockManager';
import { MobileSalesHistory } from '../components/sales/MobileSalesHistory';
import { MobileMoreMenu } from '../components/more/MobileMoreMenu';
import { useIsMobile } from '../hooks/use-mobile';
import { Smartphone, Monitor } from 'lucide-react';

export default function Index() {
  // Initialize storage with Tara Collection defaults
  useEffect(() => {
    StorageService.init();
  }, []);

  const isScreenMobile = useIsMobile();
  const [forceViewMode, setForceViewMode] = useState<'mobile' | 'desktop' | null>(null);

  // Active view mode: default to 'mobile' if screen is mobile or if explicitly chosen
  const isMobileView = forceViewMode !== null ? forceViewMode === 'mobile' : isScreenMobile;

  // Desktop active tab
  const [activeTab, setActiveTab] = useState<ActiveTab>('billing');

  // Mobile active tab: 'billing' | 'stock' | 'bills' | 'more'
  const [mobileTab, setMobileTab] = useState<MobileTab>('billing');

  const [currentUser, setCurrentUser] = useState<User>(StorageService.getCurrentUser());
  const [shopSettings, setShopSettings] = useState<ShopSettings>(StorageService.getSettings());
  const [isUserSwitchOpen, setIsUserSwitchOpen] = useState(false);

  // Keep settings synced
  const handleSettingsUpdated = (newSettings: ShopSettings) => {
    setShopSettings(newSettings);
  };

  // Keyboard shortcut listener (for desktop)
  useEffect(() => {
    const handleGlobalKey = (e: KeyboardEvent) => {
      if (e.key === 'F2') {
        setActiveTab('billing');
        setMobileTab('billing');
      }
    };
    window.addEventListener('keydown', handleGlobalKey);
    return () => window.removeEventListener('keydown', handleGlobalKey);
  }, []);

  // ----------------------------------------------------
  // MOBILE-FIRST INTERFACE (Primary phone-optimized UI)
  // ----------------------------------------------------
  if (isMobileView) {
    return (
      <div className="flex flex-col h-screen w-screen overflow-hidden bg-slate-100 font-sans antialiased text-slate-800">
        {/* Mobile Sticky Header */}
        <MobileHeader
          currentUser={currentUser}
          shopSettings={shopSettings}
          onSwitchUser={() => setIsUserSwitchOpen(true)}
        />

        {/* Mobile Main Body */}
        <main className="flex-1 flex flex-col min-h-0 overflow-hidden relative">
          {mobileTab === 'billing' && (
            <MobileBilling currentUser={currentUser} shopSettings={shopSettings} />
          )}

          {mobileTab === 'stock' && (
            <MobileStockManager currentUser={currentUser} shopSettings={shopSettings} />
          )}

          {mobileTab === 'bills' && (
            <MobileSalesHistory currentUser={currentUser} shopSettings={shopSettings} />
          )}

          {mobileTab === 'more' && (
            <MobileMoreMenu
              currentUser={currentUser}
              shopSettings={shopSettings}
              onSettingsUpdated={handleSettingsUpdated}
              onSwitchUser={() => setIsUserSwitchOpen(true)}
              onNavigateToBilling={() => setMobileTab('billing')}
            />
          )}
        </main>

        {/* Fixed 4-Item Bottom Navigation */}
        <MobileBottomNav
          activeTab={mobileTab}
          setActiveTab={setMobileTab}
          cartCount={0}
        />

        {/* PIN & Role Authentication Switch Modal */}
        <UserSwitchModal
          isOpen={isUserSwitchOpen}
          onClose={() => setIsUserSwitchOpen(false)}
          currentUser={currentUser}
          onUserChanged={(u) => setCurrentUser(u)}
        />
      </div>
    );
  }

  // ----------------------------------------------------
  // DESKTOP INTERFACE (Fallback for wide screens / testing)
  // ----------------------------------------------------
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-100 font-sans antialiased text-slate-800">
      {/* Fixed Left Navigation Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        shopName={shopSettings.shopName}
      />

      {/* Main App Column */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Compact Header Bar */}
        <Header
          currentUser={currentUser}
          shopSettings={shopSettings}
          onSwitchUserClick={() => setIsUserSwitchOpen(true)}
          setActiveTab={setActiveTab}
        />

        {/* Content Region */}
        <main className="flex-1 flex min-w-0 overflow-hidden relative">
          {activeTab === 'dashboard' && (
            <ShopDashboard
              setActiveTab={setActiveTab}
              shopSettings={shopSettings}
              currentUser={currentUser}
            />
          )}

          {activeTab === 'billing' && (
            <POSBilling currentUser={currentUser} shopSettings={shopSettings} />
          )}

          {activeTab === 'sales' && (
            <SalesHistory currentUser={currentUser} shopSettings={shopSettings} />
          )}

          {activeTab === 'products' && (
            <ProductManager currentUser={currentUser} shopSettings={shopSettings} />
          )}

          {activeTab === 'inventory' && (
            <InventoryManager currentUser={currentUser} shopSettings={shopSettings} />
          )}

          {activeTab === 'purchases' && (
            <PurchaseManager currentUser={currentUser} shopSettings={shopSettings} />
          )}

          {activeTab === 'suppliers' && (
            <SupplierManager currentUser={currentUser} shopSettings={shopSettings} />
          )}

          {activeTab === 'customers' && (
            <CustomerManager currentUser={currentUser} shopSettings={shopSettings} />
          )}

          {activeTab === 'returns' && (
            <ReturnManager currentUser={currentUser} shopSettings={shopSettings} />
          )}

          {activeTab === 'expenses' && (
            <ExpenseManager currentUser={currentUser} shopSettings={shopSettings} />
          )}

          {activeTab === 'reports' && (
            <ReportsManager currentUser={currentUser} shopSettings={shopSettings} />
          )}

          {activeTab === 'settings' && (
            <SettingsManager
              currentUser={currentUser}
              shopSettings={shopSettings}
              onSettingsUpdated={handleSettingsUpdated}
            />
          )}
        </main>
      </div>

      {/* PIN & Role Authentication Switch Modal */}
      <UserSwitchModal
        isOpen={isUserSwitchOpen}
        onClose={() => setIsUserSwitchOpen(false)}
        currentUser={currentUser}
        onUserChanged={(u) => setCurrentUser(u)}
      />
    </div>
  );
}
