// src/components/OrganizationAnalytics.jsx
import { useState, useEffect } from 'react';
import { TrendingUp, DollarSign, Activity, Zap } from 'lucide-react';

function OrganizationAnalytics({ certificates, contract }) {
    const [analytics, setAnalytics] = useState({
        totalGasUsed: 0,
        totalGasCostETH: 0,
        avgGasPerCert: 0,
        recentTransactions: []
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadAnalytics();
    }, [certificates]);

    const loadAnalytics = async () => {
        if (certificates.length === 0 || !contract) {
            setLoading(false);
            return;
        }

        setLoading(true);
        try {
            const provider = contract.runner.provider;
            let totalGas = 0;
            let totalCostWei = 0;
            const txDetails = [];

            // Fetch transaction receipts for certificates with transaction hashes
            const certsWithTx = certificates.filter(c => c.transactionHash);

            for (const cert of certsWithTx.slice(0, 10)) { // Limit to 10 for performance
                try {
                    const receipt = await provider.getTransactionReceipt(cert.transactionHash);
                    if (receipt) {
                        const gasUsed = Number(receipt.gasUsed);
                        const tx = await provider.getTransaction(cert.transactionHash);
                        const gasPrice = Number(tx.gasPrice);
                        const gasCostWei = gasUsed * gasPrice;

                        totalGas += gasUsed;
                        totalCostWei += gasCostWei;

                        txDetails.push({
                            certId: cert.certId,
                            studentName: cert.studentName,
                            formationName: cert.skillName,
                            gasUsed: gasUsed.toLocaleString(),
                            gasCostETH: (gasCostWei / 1e18).toFixed(6),
                            txHash: cert.transactionHash,
                            date: cert.dateIssued
                        });
                    }
                } catch (err) {
                    console.error(`Error fetching receipt for ${cert.certId}:`, err);
                }
            }

            const totalCertificatesWithTx = txDetails.length;
            setAnalytics({
                totalGasUsed: totalGas.toLocaleString(),
                totalGasCostETH: (totalCostWei / 1e18).toFixed(6),
                avgGasPerCert: totalCertificatesWithTx > 0 ? Math.round(totalGas / totalCertificatesWithTx).toLocaleString() : 0,
                recentTransactions: txDetails
            });
        } catch (error) {
            console.error('Error loading analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4 sm:p-8">
                <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-4 border-blue-600 border-t-transparent"></div>
                    <span className="ml-3 sm:ml-4 text-sm sm:text-base text-gray-600">Chargement des analytics...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4 sm:space-y-6">
            {/* Analytics Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-6">
                <div className="bg-white rounded-xl p-4 sm:p-6 shadow-lg border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-500 text-xs sm:text-sm font-medium mb-1">Total Gas Utilisé</p>
                            <p className="text-2xl sm:text-3xl font-bold text-gray-900">{analytics.totalGasUsed}</p>
                            <p className="text-xs text-gray-400 mt-1">Unités de gas</p>
                        </div>
                        <div className="bg-purple-100 p-2 sm:p-3 rounded-xl">
                            <Zap className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl p-4 sm:p-6 shadow-lg border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-500 text-xs sm:text-sm font-medium mb-1">Coût Total</p>
                            <p className="text-2xl sm:text-3xl font-bold text-gray-900">{analytics.totalGasCostETH}</p>
                            <p className="text-xs text-gray-400 mt-1">ETH</p>
                        </div>
                        <div className="bg-green-100 p-2 sm:p-3 rounded-xl">
                            <DollarSign className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl p-4 sm:p-6 shadow-lg border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-500 text-xs sm:text-sm font-medium mb-1">Moy. Gas/Cert</p>
                            <p className="text-2xl sm:text-3xl font-bold text-gray-900">{analytics.avgGasPerCert}</p>
                            <p className="text-xs text-gray-400 mt-1">Gas par certificat</p>
                        </div>
                        <div className="bg-blue-100 p-2 sm:p-3 rounded-xl">
                            <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Transactions Table */}
            {analytics.recentTransactions.length > 0 && (
                <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                    <div className="p-4 sm:p-6 border-b border-gray-200">
                        <div className="flex items-center space-x-2">
                            <Activity className="w-5 h-5 text-blue-600" />
                            <h3 className="text-base sm:text-lg font-bold text-gray-900">Transactions Récentes</h3>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[700px]">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID Certificat</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Étudiant</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Formation</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Gas Utilisé</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Coût (ETH)</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {analytics.recentTransactions.map((tx, index) => (
                                    <tr key={index} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-sm font-mono text-gray-900">{tx.certId}</span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-sm text-gray-900">{tx.studentName}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm text-gray-600">{tx.formationName}</span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-sm font-mono text-purple-600">{tx.gasUsed}</span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-sm font-mono text-green-600">{tx.gasCostETH}</span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-sm text-gray-500">{tx.date}</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {analytics.recentTransactions.length === 0 && !loading && (
                <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8 sm:p-12 text-center">
                    <Activity className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-4" />
                    <h4 className="text-base sm:text-lg font-bold text-gray-900 mb-2">Aucune donnée disponible</h4>
                    <p className="text-sm sm:text-base text-gray-600">Les analytics seront disponibles une fois que des certificats seront émis.</p>
                </div>
            )}
        </div>
    );
}

export default OrganizationAnalytics;
