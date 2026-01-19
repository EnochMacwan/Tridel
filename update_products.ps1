$head = Get-Content products.html -TotalCount 631
$tail = Get-Content products.html | Select-Object -Skip 728
$html = @"
        <!-- 3. Integrated Solutions -->
                <div id="integrated-solutions" class="product-category">
                    <h2 class="category-title">Integrated Solutions</h2>
                    <div class="product-grid-wrapper">
                        <!-- GeoDB -->
                        <a href="products/product-geodb.html" class="product-card-link" style="text-decoration: none; color: inherit; display: block;">
                            <div class="product-card" style="height: 100%;">
                                <div class="product-card__icon">
                                    <i class="fas fa-database"></i>
                                </div>
                                <h4 class="product-card__title">GeoDB</h4>
                                <p class="product-card__description">
                                    Geospatial Database solutions for large-scale hydrographic data storage and retrieval.
                                </p>
                                <span class="btn btn--primary" style="margin-top: auto;">View Details</span>
                            </div>
                        </a>

                        <!-- Beach MS -->
                        <a href="products/product-beach-ms.html" class="product-card-link" style="text-decoration: none; color: inherit; display: block;">
                            <div class="product-card" style="height: 100%;">
                                <div class="product-card__icon">
                                    <i class="fas fa-umbrella-beach"></i>
                                </div>
                                <h4 class="product-card__title">Beach MS</h4>
                                <p class="product-card__description">
                                    Beach Monitoring System employed for coastal usage and erosion monitoring.
                                </p>
                                <span class="btn btn--primary" style="margin-top: auto;">View Details</span>
                            </div>
                        </a>

                        <!-- Port MS -->
                        <a href="products/product-port-ms.html" class="product-card-link" style="text-decoration: none; color: inherit; display: block;">
                            <div class="product-card" style="height: 100%;">
                                <div class="product-card__icon">
                                    <i class="fas fa-anchor"></i>
                                </div>
                                <h4 class="product-card__title">Port MS</h4>
                                <p class="product-card__description">
                                    Port Monitoring System for operational efficiency and environmental compliance.
                                </p>
                                <span class="btn btn--primary" style="margin-top: auto;">View Details</span>
                            </div>
                        </a>

                        <!-- ECFS -->
                        <a href="products/product-ecfs.html" class="product-card-link" style="text-decoration: none; color: inherit; display: block;">
                            <div class="product-card" style="height: 100%;">
                                <div class="product-card__icon">
                                    <i class="fas fa-ship"></i>
                                </div>
                                <h4 class="product-card__title">ECFS</h4>
                                <p class="product-card__description">
                                    Electronic Charting & Forecasting System.
                                </p>
                                <span class="btn btn--primary" style="margin-top: auto;">View Details</span>
                            </div>
                        </a>

                        <!-- AQMS (VBS) -->
                        <a href="products/product-aqms.html" class="product-card-link" style="text-decoration: none; color: inherit; display: block;">
                            <div class="product-card" style="height: 100%;">
                                <div class="product-card__icon">
                                    <i class="fas fa-wind"></i>
                                </div>
                                <h4 class="product-card__title">AQMS (VBS)</h4>
                                <p class="product-card__description">
                                    Air Quality Monitoring System (Vessel Based System).
                                </p>
                                <span class="btn btn--primary" style="margin-top: auto;">View Details</span>
                            </div>
                        </a>

                        <!-- Forecasting systems -->
                        <a href="products/product-forecasting-systems.html" class="product-card-link" style="text-decoration: none; color: inherit; display: block;">
                            <div class="product-card" style="height: 100%;">
                                <div class="product-card__icon">
                                    <i class="fas fa-cloud-showers-heavy"></i>
                                </div>
                                <h4 class="product-card__title">Forecasting systems</h4>
                                <p class="product-card__description">
                                    Advanced met-ocean forecasting systems for operational planning.
                                </p>
                                <span class="btn btn--primary" style="margin-top: auto;">View Details</span>
                            </div>
                        </a>
                    </div>
                </div>
        </section>
"@
Set-Content -Path new_products.html -Value $head -Encoding UTF8
Add-Content -Path new_products.html -Value $html -Encoding UTF8
Add-Content -Path new_products.html -Value $tail -Encoding UTF8
Move-Item -Path new_products.html -Destination products.html -Force
